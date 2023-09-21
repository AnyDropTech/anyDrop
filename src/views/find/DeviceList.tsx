import { invoke } from '@tauri-apps/api'
import { Button, Empty } from 'antd'
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

  const handleOpen = (password: string) => {
    invoke('select_send_file').then((res) => {
      console.log(res)
      const filePath = res[0]
      invoke('send_file_client', { filePath, password, receiveDir: data.receive_dir }).then((sendRes) => {
        console.log(sendRes)
      })
    })
  }

  const handleGetFile = (password: string, filePath: string) => {
    console.log(data)
    invoke('reciver_save_file', { password, filePath, receiveDir: data.receive_dir }).then((res) => {
      console.log(res)
    })
  }

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
      {data.is_file === 'true' ? <Button type="primary" onClick={() => handleGetFile(data.password, data.name)}>接收文件</Button> : <Button type="primary" onClick={() => handleOpen(data.password)}>选择文件</Button>}

    </div>
  )
}

export default function DeviceList(props: IDevicesProps) {
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
