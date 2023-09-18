import { BaseDirectory, homeDir } from '@tauri-apps/api/path'
import { metadata, readTextFile } from '@tauri-apps/plugin-fs'
import type { CollapseProps, UploadProps } from 'antd'
import { Collapse, message, Upload } from 'antd'
import { useEffect, useState } from 'react'

import { SenderIcon } from '../../components'

import DeviceList from './DeviceList'
import type { IQueryRes } from './types'

const { Dragger } = Upload

// const { useToken } = theme

async function checkConfig() {
  try {
    const appConfigPath = await homeDir()
    const configFilePath = `${appConfigPath}/anydrop.config.conf`
    const meta = await metadata(configFilePath)
    return meta.permissions.readonly === false
  }
  catch (error) {
    return false
  }
}

async function getConfig() {
  const checkRef = await checkConfig()
  if (checkRef) {
    const saveContent = await readTextFile('anydrop.config.conf', { dir: BaseDirectory.Home })
    const config = (() => {
      try {
        return JSON.parse(saveContent)
      }
      catch (error) {
        return null
      }
    })()
    return config
  }
  return null
}

const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
  onChange(info) {
    const { status } = info.file
    if (status !== 'uploading')
      console.log(info.file, info.fileList)

    if (status === 'done')
      message.success(`${info.file.name} file uploaded successfully.`)

    else if (status === 'error')
      message.error(`${info.file.name} file upload failed.`)
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  },
}

function Find() {
  const [onlineDevices, setOnlineDevices] = useState<IQueryRes[]>([])
  const [offlineDevices, setOfflineDevices] = useState<IQueryRes[]>([])

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
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <SenderIcon />
          </p>
          <p className="ant-upload-text">拖拽或者粘贴文件/文件夹到这里</p>
          <p className="ant-upload-hint">
            支持单个文件/多个文件/文件夹
          </p>
        </Dragger>
        <List />
      </div>
    </div>
  )
}
export default Find
