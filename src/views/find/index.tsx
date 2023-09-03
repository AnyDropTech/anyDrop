import { invoke } from '@tauri-apps/api'
import type { CollapseProps } from 'antd'
import { Button, Collapse, theme } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { Platfrom } from '../../utils'

import DeviceList from './DeviceList'
import { type IDevice } from './types'

const { useToken } = theme

function Find() {
  const { token } = useToken()
  const onlineDevice: IDevice[] = [
    {
      platform: Platfrom.MAC,
      nickname: 'cavin',
      deviceName: 'mac 001',
      color: token.colorSuccessActive,
    },
  ]

  const offlineDevice: IDevice[] = [
    {
      platform: Platfrom.MAC,
      nickname: 'cavin',
      deviceName: 'mac 001',
      color: token.colorErrorActive,
    },
  ]

  const items: CollapseProps['items'] = [
    {
      key: 'online',
      label: '在线设备',
      children: <DeviceList listData={onlineDevice}/>,
    },
    {
      key: 'offline',
      label: '离线设备',
      children: <DeviceList listData={offlineDevice}/>,
    },
  ]

  const List: React.FC = () => <Collapse defaultActiveKey={['online']} ghost items={items} />

  const handleOpen = () => {
    invoke('broadcast_message', { message: 'hello', port: 12345 }).then((res) => {
      console.log(res)
    })
    setTimeout(() => {})
  }

  const [message, setMessage] = useState()
  const listenForBroadcast = useCallback(() => {
    invoke('listen_for_broadcast', { port: 12345 })
      .then((response: any) => {
        console.log('🚀 ~ file: index.tsx:59 ~ .then ~ response:', response)
        setMessage(response)
        // document.getElementById('receivedMessage').textContent = response
        // 重新调用 listenForBroadcast
        // setTimeout(listenForBroadcast, 1000) // 1秒后重新调用
      })
      .catch((error) => {
        console.error(error)
      })
  }, [message])

  useEffect(() => {
    listenForBroadcast()
  }, [listenForBroadcast])

  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <Button type="primary" onClick={handleOpen}>开启</Button>
        <List />
      </div>
    </div>
  )
}
export default Find
