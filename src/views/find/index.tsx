import type { CollapseProps } from 'antd'
import { Collapse, theme } from 'antd'

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

  const List: React.FC = () => <Collapse defaultActiveKey={['1']} ghost items={items} />
  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <List />
      </div>
    </div>
  )
}
export default Find
