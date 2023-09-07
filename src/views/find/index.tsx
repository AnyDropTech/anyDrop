import { invoke } from '@tauri-apps/api'
import type { CollapseProps } from 'antd'
import { Button, Collapse, theme } from 'antd'
import { useState } from 'react'

import { Platfrom } from '../../utils'

import DeviceList from './DeviceList'
import type { IDevice, IQueryRes } from './types'

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

  const [devices, setDevices] = useState<IQueryRes[]>([])

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
      children: <DeviceList listData={devices}/>,
    },
    {
      key: 'offline',
      label: '离线设备',
      children: <DeviceList listData={[]}/>,
    },
  ]

  const List: React.FC = () => <Collapse defaultActiveKey={['online']} ghost items={items} />

  const handleOpen = () => {
    invoke('start_broadcast_command', { magicString: 'hello', data: { name: '1', test: '2' } }).then((res) => {
      console.log(res)

      invoke<IQueryRes>('query_service', { magicString: 'hello' }).then((res) => {
        setDevices(devices.concat(res))
      })
    }).catch((e) => {
      console.error(e)
    })
  }

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
      </div>
    </div>
  )
}
export default Find
