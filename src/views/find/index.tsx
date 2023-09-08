import { invoke } from '@tauri-apps/api'
import { BaseDirectory, homeDir } from '@tauri-apps/api/path'
import { metadata, readTextFile } from '@tauri-apps/plugin-fs'
import type { CollapseProps } from 'antd'
import { Button, Collapse } from 'antd'
import { useState } from 'react'

import DeviceList from './DeviceList'
import type { IQueryRes } from './types'

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
      setDevices(devices.concat(res))
    })
  }

  const handleOpen = async () => {
    const config = await getConfig()
    if (config) {
      invoke('start_broadcast_command', { data: config }).then((res) => {
        console.log(res)
        queryDevice()
      }).catch((e) => {
        console.error(e)
      })
    }
    else {
      alert('配置文件不存在')
    }
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
