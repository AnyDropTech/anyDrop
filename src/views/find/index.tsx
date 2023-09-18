import type { CollapseProps } from 'antd'
import { Collapse } from 'antd'
import { useEffect, useState } from 'react'

import { ClearIcon, FileIcon, FloderIcon, PasteIcon, SenderIcon } from '../../components'

import DeviceList from './DeviceList'
import type { IQueryRes } from './types'

import './index.scss'

function Find() {
  const [onlineDevices, setOnlineDevices] = useState<IQueryRes[]>([])
  const [offlineDevices, setOfflineDevices] = useState<IQueryRes[]>([])
  const [isActive, setIsActive] = useState(false)
  let timer: null | number = null
  const handleDragMouseOver = () => {
    if (timer)
      clearTimeout(timer)
    setIsActive(true)
  }
  const handleDragMouseLeave = () => {
    if (timer)
      clearTimeout(timer)

    timer = window.setTimeout(() => {
      setIsActive(false)
    }, 1000)
  }

  const items: CollapseProps['items'] = [
    {
      key: 'online',
      label: '在线设备',
      children: <DeviceList listData={onlineDevices} />,
    },
    {
      key: 'offline',
      label: '离线设备',
      children: <DeviceList listData={offlineDevices} />,
    },
  ]

  const List: React.FC = () => <Collapse defaultActiveKey={['online']} ghost items={items} />

  useEffect(() => {
  }, [])

  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <ul className={['tool-container', isActive ? 'active' : ''].join(' ')} onMouseEnter={handleDragMouseOver} onMouseLeave={handleDragMouseLeave}>
          <li className="tool-item">
            <FileIcon />
          </li>
          <li className="tool-item">
            <FloderIcon />
          </li>
          <li className="tool-item">
            <PasteIcon />
          </li>
          <li className="tool-item">
            <ClearIcon />
          </li>
        </ul>
        <div className="drag-container" onMouseEnter={handleDragMouseOver} onMouseLeave={handleDragMouseLeave}>
          <SenderIcon />
          <div className="drag-content">
            <p className="ant-upload-text">拖拽或者粘贴文件/文件夹到这里</p>
            <p className="ant-upload-hint">
              支持单个文件/多个文件/文件夹
            </p>
          </div>
        </div>
        <List />
      </div>
    </div>
  )
}
export default Find
