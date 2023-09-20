import * as tauriEvent from '@tauri-apps/api/event'
import * as tauriPath from '@tauri-apps/api/path'
import { metadata } from '@tauri-apps/plugin-fs'
import type { CollapseProps } from 'antd'
import { Button, Collapse } from 'antd'
import { memo, useCallback, useEffect, useState } from 'react'
import { throttle } from 'throttle-debounce'

import { ClearIcon, DownIcon, FileIcon, FloderIcon, PasteIcon, SenderIcon } from '../../components'
import { WifiIcon } from '../../components/icons/files'
import { formatFileSize } from '../../utils'

import DeviceList from './DeviceList'
import type { IFileItem } from './fileList'
import { FileList } from './fileList'
import type { IQueryRes } from './types'

import './index.scss'

async function getFileInfo(paths: string[]) {
  const fileInfos: Array<IFileItem> = []
  for (let i = 0; i < paths.length; i++) {
    const medata = await metadata(paths[i])
    const baseName = await tauriPath.basename(paths[i])
    const extname = await tauriPath.extname(paths[i])
    fileInfos.push({
      name: baseName,
      ext: extname,
      size: formatFileSize(medata.size),
    })
  }
  return fileInfos
}

function Find() {
  const [onlineDevices, setOnlineDevices] = useState<IQueryRes[]>([])
  const [offlineDevices, setOfflineDevices] = useState<IQueryRes[]>([])
  const [isActive, setIsActive] = useState(false)
  let timer: null | number = null
  const handleDragMouseOver = () => {
    if (timer)
      clearTimeout(timer)
    setIsActive(true)
  }
  const handleDragMouseLeave = () => {
    if (timer)
      clearTimeout(timer)

    timer = window.setTimeout(() => {
      setIsActive(false)
    }, 1000)
  }

  const items: CollapseProps['items'] = [
    {
      key: 'online',
      label: '在线设备',
      children: <DeviceList listData={onlineDevices} />,
    },
    {
      key: 'offline',
      label: '离线设备',
      children: <DeviceList listData={offlineDevices} />,
    },
  ]

  const List: React.FC = () => <Collapse defaultActiveKey={['online']} ghost items={items} />

  const [isDragOver, setIsDragOver] = useState(false)
  const [currentFiles, setCurrentFiles] = useState<Array<IFileItem>>([])
  const [pendingFiles, setPendingFiles] = useState<Array<IFileItem>>([])

  let currentDropFile: string[] = []
  const isCurrentDrop = (files: string[]) => {
    return files.every(file => currentDropFile.includes(file))
  }

  const handleFileDrop: tauriEvent.EventCallback<string[]> = useCallback(async (data) => {
    const files = data.payload
    if (isCurrentDrop(files))
      return
    currentDropFile = files
    const _files = files.filter(file => !pendingFiles.some(item => item.name === file))
    const fileInfo = await getFileInfo(_files)
    const allFiles = [
      ...fileInfo,
      ...pendingFiles,
    ]
    setPendingFiles(allFiles)
    setCurrentFiles([])
    setIsDragOver(false)
  }, [pendingFiles, setIsDragOver, setCurrentFiles, setPendingFiles])

  const handleFileDropHover = useCallback(throttle<tauriEvent.EventCallback<string[]>>(200, async (data) => {
    const files = data.payload
    if (!files.length)
      return

    const currentFiles: Array<IFileItem> = []
    for (const file of files) {
      const name = await tauriPath.basename(file)
      currentFiles.push({
        name,
        size: '',
        ext: '',
      })
    }
    setCurrentFiles(currentFiles)
    setIsDragOver(true)
  }), [setCurrentFiles, setIsDragOver])

  const handleFileDropCancelled = useCallback(throttle<tauriEvent.EventCallback<string[]>>(200, (data) => {
    console.log('hover-cancel', data)
    setIsDragOver(false)
    setCurrentFiles([])
  }), [setCurrentFiles, setIsDragOver])

  const handleClearFiles = () => {
    setPendingFiles([])
    setCurrentFiles([])
  }

  const handleRemoveFileItem = (index: number) => {
    pendingFiles.splice(index, 1)
    setPendingFiles([...pendingFiles])
  }

  useEffect(() => {
    const dropDestory = tauriEvent.listen<string[]>('tauri://file-drop', handleFileDrop)
    const dropHoverDestory = tauriEvent.listen('tauri://file-drop-hover', handleFileDropHover)
    const dropHoverCancelDestory = tauriEvent.listen('tauri://file-drop-cancelled', handleFileDropCancelled)

    return () => {
      dropDestory.then(destory => destory())
      dropHoverDestory.then(destory => destory())
      dropHoverCancelDestory.then(destory => destory())
    }
  }, [handleFileDrop, handleFileDropHover, handleFileDropCancelled])

  const DropUi = memo(() => {
    return (
      <>
        <SenderIcon />
        <div className="drag-content">
          <p className="ant-upload-text">拖拽或者粘贴文件/文件夹到这里</p>
          <p className="ant-upload-hint">
            支持单个文件/多个文件/文件夹
          </p>
        </div>
      </>
    )
  })

  const DropOverUi = memo(() => {
    const fileName = currentFiles.length ? currentFiles[0].name : ''
    const fileLength = currentFiles.length - 1
    const tips = fileLength > 0 ? `等${fileLength}个文件` : ''
    return (
      <>
        <DownIcon />
        <div className="drag-content">
          <p className="ant-upload-text">添加{fileName}{tips}</p>
        </div>
      </>
    )
  })

  return (
    <div className="page-find">
      {/* <div className="page-header">AnyDrop V0.0.1</div> */}
      <div className="page-content">
        <div className="page-container">
          <ul className={['tool-container', isActive ? 'active' : ''].join(' ')} onMouseEnter={handleDragMouseOver} onMouseLeave={handleDragMouseLeave}>
            <li className="tool-item">
              <FileIcon />
            </li>
            <li className="tool-item">
              <FloderIcon />
            </li>
            <li className="tool-item">
              <PasteIcon />
            </li>
            <li className="tool-item" onClick={handleClearFiles}>
              <ClearIcon />
            </li>
          </ul>
          <div
            onMouseEnter={handleDragMouseOver}
            onMouseLeave={handleDragMouseLeave}
          >
            {isDragOver
              ? <div className={['drag-container', isDragOver ? 'drag-over' : ''].join(' ')}><DropOverUi /></div>
              : pendingFiles.length > 0
                ? <FileList fileList={pendingFiles} handleRemoveItem={handleRemoveFileItem} />
                : <div className={['drag-container', isDragOver ? 'drag-over' : ''].join(' ')}><DropUi /></div>
            }
          </div>
          <List />
        </div>
        <div className="find-footer">
          <div className="total-size">
            <WifiIcon />
            <span>116b</span>
          </div>
          <Button block type="primary" className='send-btn'>发&nbsp;&nbsp;&nbsp;&nbsp;送</Button>
        </div>
      </div>
    </div>
  )
}
export default Find
