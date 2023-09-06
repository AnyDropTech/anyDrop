import { invoke } from '@tauri-apps/api'
import type { CollapseProps } from 'antd'
import { Button, Collapse, theme } from 'antd'
import { useState } from 'react'

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
    invoke('start_broadcast_command', { magicString: 'hello', data: { name: '1', test: '2' } }).then((res) => {
      console.log(res)

      invoke('query_service', { magicString: 'hello' }).then((res) => {
        console.log(res)
      })
    }).catch((e) => {
      console.error(e)
    })
  }

  const [devices, setDevices] = useState([])

  // useEffect(() => {
  //   // invoke('list_network_devices')
  //   //   .then((response) => {
  //   //     setDevices(response)
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error('Error:', error)
  //   //   })
  // }, [])

  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <Button type="primary" onClick={handleOpen}>开启</Button>
        <List />
        <h1>局域网设备列表</h1>
        <ul>
          {devices.map((device, index) => (
            <li key={index}>{device}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default Find
