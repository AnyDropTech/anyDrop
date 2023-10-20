import { event } from '@tauri-apps/api'
import { Menu, theme } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { throttle } from 'throttle-debounce'

import { useStore } from '../store'
import type { ISendFileInfo } from '../types'
import type { IQueryRes } from '../views/find/types'

import './default.scss'

const turiSendConfirmUri = 'anyDrop://send_file_confirmation'
enum TAURI_EVENT {
  DISCOVERY = 'AnyDrop://client_connector_discovery',
}
const { useToken } = theme

function DefaultLayout() {
  const { token } = useToken()

  const navigate = useNavigate()

  const sidebarItems = [
    {
      key: '/',
      label: '发现',
    },
    {
      key: '/sender',
      label: '发送',
    },
    {
      key: '/recever',
      label: '接收',
    },
    {
      key: '/setting',
      label: '设置',
    },
  ]

  const { deviceInfo, receiveFileInfo } = useStore()
  const handleSetDevices = useCallback((deviceLists: IQueryRes[] = []) => {
    if (deviceLists.length)
      // insertUnique(deviceLists)
      deviceInfo.setDevicesList(deviceLists)
  }, [])

  const handleDiscovery = useCallback<event.EventCallback<IQueryRes[]>>((res) => {
    const deviceLists = res.payload
    handleSetDevices(deviceLists)
  }, [handleSetDevices])

  const handleSendFile = useCallback<event.EventCallback<ISendFileInfo>>((res) => {
    const fileInfo = res.payload
    console.log('🚀 ~ file: default.tsx:58 ~ handleSendFile ~ fileInfo:', fileInfo)
    if (fileInfo) {
      // addRecevicerInfo(fileInfo)
      receiveFileInfo.insert(fileInfo)
      navigate('/recever')
    }
  }, [])

  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const { pathname } = useLocation()

  useEffect(() => {
    const unlisten = event.listen<ISendFileInfo>(turiSendConfirmUri, handleSendFile)
    console.log('default layput mounted')

    // 发现设备
    const discoveryDestory = event.listen<IQueryRes[]>(TAURI_EVENT.DISCOVERY, throttle(1000, handleDiscovery))

    setSelectedKeys([pathname])

    return () => {
      unlisten.then(res => res())
      discoveryDestory.then(res => res())
    }
  }, [handleDiscovery, pathname])

  return (
    <div className='page'>
      {/* 统一的头部内容 */}
      <div className="main-header"></div>
      <div className="main-container">
        {/* 侧边栏 */}
        <div className="main-sidebar">
          <div className='main-logo' style={{ background: token.colorBgContainer, color: token.colorPrimaryActive }}>
            <div>Any</div>
            <div style={{ marginLeft: '10px' }}>Drop</div>
          </div>
          <Menu
            className='sidebar-menu'
            mode="vertical"
            items={sidebarItems}
            onSelect={({ key }) => {
              navigate(key)
              setSelectedKeys([key])
            }}
            selectedKeys={selectedKeys}
          />
        </div>
        {/* 内容渲染区域 */}
        <div className="main-page">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout
