import { event } from '@tauri-apps/api'
import { Menu, theme } from 'antd'
import { useCallback, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { useDiscoverDevices, useReceviderInfos } from '../hooks'
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

  function navigateTo(path: string) {
    return navigate(path)
  }

  const sidebarItems = [
    {
      key: '1',
      label: '发现',
    },
    {
      key: '2',
      label: '发送',
    },
    {
      key: '3',
      label: '接收',
    },
    {
      key: '4',
      label: '设置',
    },
  ]

  function handleMenuClick({ key }: any) {
    switch (key) {
      case '1':
        navigateTo('/')
        break
      case '2':
        navigateTo('/sender')
        break
      case '3':
        navigateTo('/recever')
        break
      case '4':
        navigateTo('/setting')
        break
      default:
        break
    }
  }

  const { receiveFileInfo, deviceInfo } = useStore()
  const { removeAll, addAll } = useDiscoverDevices()
  const handleSetDevices = useCallback((deviceLists: IQueryRes[] = [], isQuery: boolean) => {
    const onlineDevices: IQueryRes[] = []
    const offlineDevices: IQueryRes[] = []
    deviceLists.forEach((device) => {
      if (device.offline)
        offlineDevices.push(device)
      else
        onlineDevices.push(device)
    })
    deviceInfo.setOnloneList(onlineDevices)
    deviceInfo.setOfflineList(offlineDevices)

    if (!isQuery && deviceLists.length) {
      removeAll().then(() => {
        addAll(deviceLists)
      })
    }
  }, [deviceInfo, addAll, removeAll])

  const handleDiscovery = useCallback<event.EventCallback<IQueryRes[]>>((res) => {
    const deviceLists = res.payload
    handleSetDevices(deviceLists, false)
  }, [deviceInfo, handleSetDevices])

  const { addRecevicerInfo } = useReceviderInfos()
  useEffect(() => {
    const unlisten = event.listen<ISendFileInfo>(turiSendConfirmUri, (res) => {
      const fileInfo = res.payload
      if (fileInfo) {
        receiveFileInfo.setList(fileInfo)
        addRecevicerInfo(fileInfo)
        navigate('/recever')
      }
    })
    console.log('default layput mounted')

    // 发现设备
    const discoveryDestory = event.listen<IQueryRes[]>(TAURI_EVENT.DISCOVERY, handleDiscovery)

    return () => {
      unlisten.then(res => res())
      discoveryDestory.then(res => res())
    }
  }, [receiveFileInfo, addRecevicerInfo, navigate, handleDiscovery, TAURI_EVENT])

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
            defaultSelectedKeys={['1']}
            items={sidebarItems}
            onClick={handleMenuClick}
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
