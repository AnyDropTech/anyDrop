import * as tauriEvent from '@tauri-apps/api/event'
import * as tauriPath from '@tauri-apps/api/path'
import { metadata } from '@tauri-apps/plugin-fs'
import type { CollapseProps } from 'antd'
import { Collapse } from 'antd'
import { memo, useEffect, useState } from 'react'
import { throttle } from 'throttle-debounce'

import { ClearIcon, DownIcon, FileIcon, FloderIcon, PasteIcon, SenderIcon } from '../../components'
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
    fileInfos.push({
      name: baseName,
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

  useEffect(() => {
    tauriEvent.listen('tauri://file-drop', throttle(200, async (data) => {
      const files = data.payload
      console.log('drop', files)
      const fileInfo = await getFileInfo(files)
      setCurrentFiles(fileInfo)
      setIsDragOver(false)
    }))
    tauriEvent.listen('tauri://file-drop-hover', throttle(200, async (data) => {
      console.log('hover', data)
      const files = data.payload
      if (!files.length)
        return

      const currentFiles: Array<{ name: string }> = []
      for (const file of files) {
        const name = await tauriPath.basename(file)
        currentFiles.push({
          name,
        })
      }
      setCurrentFiles(currentFiles)
      setIsDragOver(true)
    }))
    tauriEvent.listen('tauri://file-drop-cancelled', throttle(200, (data) => {
      console.log('hover-cancel', data)
      setIsDragOver(false)
      setCurrentFiles([])
    }))

    return () => {
    }
  }, [setIsDragOver, setCurrentFiles, getFileInfo])

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
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        {!isDragOver && <FileList fileList={currentFiles} />}
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
          <li className="tool-item">
            <ClearIcon />
          </li>
        </ul>
        <div
          className={['drag-container', isDragOver ? 'drag-over' : ''].join(' ')}
          onMouseEnter={handleDragMouseOver}
          onMouseLeave={handleDragMouseLeave}
        >
          {isDragOver ? <DropOverUi /> : <DropUi />}
        </div>
        <List />
      </div>
    </div>
  )
}
export default Find
