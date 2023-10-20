import * as tauriEvent from '@tauri-apps/api/event'
import * as tauriPath from '@tauri-apps/api/path'
import { metadata } from '@tauri-apps/plugin-fs'
import type { CollapseProps } from 'antd'
import { Button, Collapse } from 'antd'
import { memo, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { ClearIcon, DownIcon, FileIcon, FloderIcon, PasteIcon, SenderIcon } from '../../components'
import { WifiIcon } from '../../components/icons/files'
import { useDiscoverDevices, useSenderInfos } from '../../hooks'
import { useStore } from '../../store'
import type { FileInfoItem, ISendFileInfo } from '../../types'
import { formatFileSize } from '../../utils'

import DeviceList from './DeviceList'
import type { IFileItem } from './fileList'
import { FileList } from './fileList'
import type { IDevice, IQueryRes } from './types'

import './index.scss'

enum TAURI_EVENT {
  DISCOVERY = 'AnyDrop://client_connector_discovery',
}
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

  const { discoverDevices, onInsertEvent, isFetching } = useDiscoverDevices()

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

  const [selectDevice, setSelectDevice] = useState<IQueryRes[]>([])
  const handleSelectItem = (item: IQueryRes) => {
    const index = selectDevice.findIndex(device => device.fullname === item.fullname)
    if (index > -1) {
      selectDevice.splice(index, 1)
      setSelectDevice([...selectDevice])
    }
    else {
      setSelectDevice([...selectDevice, item])
    }
  }

  const handleCheckSelected = (item: IQueryRes) => {
    return selectDevice.some(device => device.fullname === item.fullname)
  }
  const items: CollapseProps['items'] = [
    {
      key: 'online',
      label: '在线设备',
      children: <DeviceList listData={onlineDevices} checkSelected={handleCheckSelected} setSelectDevice={handleSelectItem}/>,
    },
    {
      key: 'offline',
      label: '离线设备',
      children: <DeviceList listData={offlineDevices} />,
    },
  ]

  const List = memo(() => <Collapse defaultActiveKey={['online']} ghost items={items} />)

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

  const handleSaveDevices = useCallback((deviceLists: IQueryRes[] = []) => {
    if (onlineDevices.length || offlineDevices.length)
      return
    const _onlineDevices: IQueryRes[] = []
    const _offlineDevices: IQueryRes[] = []
    deviceLists.forEach((device) => {
      if (device.offline)
        _offlineDevices.push(device)
      else
        _onlineDevices.push(device)
    })
    setOnlineDevices(_onlineDevices)
    setOfflineDevices(_offlineDevices)
  }, [setOnlineDevices, setOfflineDevices, onlineDevices, offlineDevices])

  // handleSaveDevices(discoverDevices.map(item => ({
  //   ...item,
  //   data: item.data as IDevice,
  // }) as IQueryRes))

  const handleClearFiles = () => {
    setPendingFiles([])
    setCurrentFiles([])
  }

  const handleRemoveFileItem = (index: number) => {
    pendingFiles.splice(index, 1)
    setPendingFiles([...pendingFiles])
  }
  const { sendFileInfo } = useStore()
  const navigate = useNavigate()
  const { addAll: senderInfoAddAll } = useSenderInfos()
  const handleSendFile = () => {
    const files = pendingFiles
    const devices = selectDevice

    const selectFileForDevices: ISendFileInfo[] = devices.map((item) => {
      return {
        id: item.id || '',
        ip: item.ip_addrs[0],
        fullname: item.fullname,
        device_name: item.hostname,
        port: item.port,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          ext: file.ext,
          path: file.name,
        })) as FileInfoItem[],
      }
    })

    selectFileForDevices.forEach((item) => {
      sendFileInfo.setList(item)
    })

    senderInfoAddAll(selectFileForDevices)

    handleClearFiles()
    setSelectDevice([])
    navigate('/sender')
  }

  const [isFirst, setIsFirst] = useState(true)
  useEffect(() => {
    console.log('mount')
    const dropDestory = tauriEvent.listen<string[]>('tauri://file-drop', handleFileDrop)
    const dropHoverDestory = tauriEvent.listen('tauri://file-drop-hover', handleFileDropHover)
    const dropHoverCancelDestory = tauriEvent.listen('tauri://file-drop-cancelled', handleFileDropCancelled)

    // let timer: null | number = null
    // if (isFirst) {
    //   timer = window.setTimeout(() => {
    //     getAll().then((deviceLists) => {
    //       console.log('🚀 ~ file: index.tsx:208 ~ getAll ~ deviceLists:', deviceLists)
    //       handleSaveDevices(deviceLists?.map(item => ({
    //         ...item,
    //         data: item.data as IDevice,
    //       })))
    //       setIsFirst(false)
    //     })
    //   })
    // }
    console.log('discoverDevices', discoverDevices, isFirst)
    handleSaveDevices(discoverDevices.map(item => ({
      ...item,
      data: item.data as IDevice,
    }) as IQueryRes))

    // 获取缓存的设备列表
    const insertObserver = onInsertEvent((docData) => {
      console.log('onInsertEvent', docData)
      const { id, fullname, data, ip_addrs, offline, port } = docData
      const deviceData = { id, fullname, data: data as IDevice, ip_addrs, offline, port } as IQueryRes
      if (offline) {
        const hasDevice = offlineDevices.some(device => device.fullname === fullname)
        if (!hasDevice)
          setOfflineDevices([...offlineDevices, deviceData])
      }
      else {
        const hasDevice = onlineDevices.some(device => device.fullname === fullname)
        if (!hasDevice)
          setOnlineDevices([...onlineDevices, deviceData])
      }
    })

    return () => {
      console.log('unmount')
      dropDestory.then(destory => destory())
      dropHoverDestory.then(destory => destory())
      dropHoverCancelDestory.then(destory => destory())
      insertObserver?.unsubscribe()
      // timer && clearTimeout(timer)
      // discoveryDestory.then(destory => destory())
    }
  }, [handleFileDrop, handleFileDropHover, handleFileDropCancelled, handleSaveDevices, discoverDevices, onlineDevices, offlineDevices])

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
          {isFetching ? <div className="loading">正在搜索设备...</div> : <List />}
        </div>
        <div className="find-footer">
          <div className="total-size">
            <WifiIcon />
            <span>{currentFiles.reduce((pre, cur) => {
              return pre + Number(cur.size)
            }, 0)}b</span>
          </div>
          <Button block type="primary" disabled={pendingFiles.length === 0 || selectDevice.length === 0} className='send-btn' onClick={handleSendFile}>发&nbsp;&nbsp;&nbsp;&nbsp;送</Button>
        </div>
      </div>
    </div>
  )
}
export default Find
