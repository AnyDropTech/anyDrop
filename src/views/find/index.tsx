import { invoke } from '@tauri-apps/api'
import type { CollapseProps } from 'antd'
import { Button, Collapse, theme } from 'antd'
import { useState } from 'react'

import DeviceList from './DeviceList'
import type { IQueryRes } from './types'

const { useToken } = theme

function Find() {
  const { token } = useToken()

  const [devices, setDevices] = useState<IQueryRes[]>([])

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

  const queryDevice = () => {
    invoke('query_service', { magicString: 'hello' }).then((res: any) => {
      console.log(res)
      setDevices(devices.concat(res))
    })
  }

  const handleOpen = () => {
    invoke('start_broadcast_command', { magicString: 'hello', data: { name: '1', test: '2' } }).then((res) => {
      console.log(res)
      queryDevice()
    }).catch((e) => {
      console.error(e)
    })
  }

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
