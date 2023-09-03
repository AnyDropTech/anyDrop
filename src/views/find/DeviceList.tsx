import React from 'react'

import type { IDevice } from './types'

import MacIcon from '../../assets/MacBook.svg'

import './DeviceList.scss'

export interface IDevicesProps {
  listData: IDevice[]
}

export const DeviceItem: React.FC<IDevice> = (props) => {
  const { nickname, platform, color, deviceName } = props
  return (
    <div className="device-item">
      <div className="device-item__icon">
        <img src={MacIcon} alt="icon" />
        <span className='device-status' style={{ backgroundColor: color }}></span>
      </div>
      <div className="device-item-info">
        <div className="device-item-name">{nickname}</div>
        <div className='device-item-device_name'>{deviceName}</div>
      </div>
    </div>
  )
}

export default function DeviceList(props: IDevicesProps) {
  return (
    <div className="device-list">
      {props.listData.map(item => (
        <DeviceItem key={item.nickname} {...item} />
      ))}
    </div>
  )
}
