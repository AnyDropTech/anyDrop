import { Empty } from 'antd'
import React from 'react'

import type { IDevice, IQueryRes } from './types'

import MacIcon from '../../assets/MacBook.svg'

import './DeviceList.scss'

export interface IDevicesProps {
  listData: IQueryRes[]
}

export const DeviceItem: React.FC<{ data: IDevice }> = (props) => {
  const { data } = props
  console.log(data)
  return (
    <div className="device-item">
      <div className="device-item__icon">
        <img src={MacIcon} alt="icon" />
        <span className='device-status' style={{ backgroundColor: data.color }}></span>
      </div>
      <div className="device-item-info">
        <div className="device-item-name">{data.nickname}</div>
        <div className='device-item-device_name'>{data.device_name}</div>
      </div>
    </div>
  )
}

export default function DeviceList(props: IDevicesProps) {
  console.log('🚀 ~ file: DeviceList.tsx:31 ~ DeviceList ~ props:', props)
  return (
    <div className="device-list">
      {props.listData.map((item, index) => (
        <DeviceItem key={item.fullname + index} data={item.data} />
      ))}
      {props.listData.length === 0
        && <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 60 }}
          description={
            <span>
              暂无设备
            </span>
          }
        />
      }
    </div>
  )
}
