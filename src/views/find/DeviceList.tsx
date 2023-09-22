import { invoke } from '@tauri-apps/api'
import { Button, Empty } from 'antd'
import React, { memo } from 'react'

import type { IDevice, IQueryRes } from './types'

import MacIcon from '../../assets/MacBook.svg'

import './DeviceList.scss'

export interface IDevicesProps {
  listData: IQueryRes[]
  setSelectDevice?: (item: IQueryRes) => void
  checkSelected?: (item: IQueryRes) => boolean
}

export const DeviceItem: React.FC<{ data: IDevice; item: IQueryRes; index: number; onClick: (index: number) => void; checkSelected: (item: IQueryRes) => boolean }> = memo((props) => {
  const { data, index, onClick, checkSelected, item } = props
  const handleSend = (ip: string) => {
    console.log(ip)
    invoke('send_file_confirmation', { targetIp: ip }).then((res) => {
      console.log(res)
    })
  }
  return (
    <div className={['device-item', checkSelected(item) ? 'active' : ''].join(' ')} onClick={() => onClick(index)}>
      <div className="device-item__icon">
        <img src={MacIcon} alt="icon" />
        {/* <span className='device-status' style={{ backgroundColor: data.color }}></span> */}
      </div>
      <div className="device-item-info">
        <div className="device-item-name">{data.nickname}</div>
        <div className='device-item-device_name'>{data.device_name}</div>
      </div>
      <Button onClick={() => handleSend(item.ip_addrs[0])}>test</Button>
    </div>
  )
}) // 优化性能，避免不必要的渲染

export default function DeviceList(props: IDevicesProps) {
  const handleItemClick = (index: number) => {
    props.setSelectDevice?.(props.listData[index])
  }
  return (
    <div className="device-list">
      {props.listData.map((item, index) => (
        <DeviceItem key={item.fullname + index} item={item} data={item.data} checkSelected={props.checkSelected!} index={index} onClick={handleItemClick} />
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
