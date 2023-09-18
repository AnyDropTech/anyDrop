import { downloadDir, homeDir } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, metadata, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { hostname, platform } from '@tauri-apps/plugin-os'
import type { FormInstance } from 'antd'
import { Button, Card, Form, Input, Space, Switch } from 'antd'
import React, { useCallback, useEffect } from 'react'

import type { IDeviceConfig } from '../../types'
import { randomNum } from '../../utils'

async function saveConfig(config: IDeviceConfig) {
  await writeTextFile('anydrop.config.conf', JSON.stringify(config), { dir: BaseDirectory.Home })
  readTextFile('anydrop.config.conf', { dir: BaseDirectory.Home }).then((res) => {
    console.log(res)
  })
}

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

function ConfigForm() {
  const [form] = Form.useForm<IDeviceConfig>()
  const formRef = React.useRef<FormInstance>(null)

  const getLocaleIp = useCallback(async () => {
    const ip = await invoke<string>('get_locale_ip')
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

      if (config) {
        form.setFieldsValue({ ...config, ip })
      }
      else {
        const hostName = await hostname()

        const nickname = `AnyDrop_${randomNum(4).toString()}`
        const dirName = await downloadDir()
        const _platform = await platform()
        form.setFieldsValue({ ip, device_name: hostName || '', nickname, receive_dir: `${dirName}${_platform === 'windows' ? '\\' : '/'}AnyDropFiles`, history: true })
      }
    }
    else {
      const hostName = await hostname()

      const nickname = `AnyDrop_${randomNum(4).toString()}`
      const dirName = await downloadDir()
      const _platform = await platform()
      form.setFieldsValue({ ip, device_name: hostName || '', nickname, receive_dir: `${dirName}${_platform === 'windows' ? '\\' : '/'}AnyDropFiles`, history: true })
    }

    if (!checkRef) {
      const config = form.getFieldsValue()
      await saveConfig(config)
    }
  }, [])

  const handleFormFinish = (values: IDeviceConfig) => {
    saveConfig(values)
  }

  const handleSelectPath = () => {
    invoke<string>('get_user_savepath').then((res) => {
      if (res)
        form.setFieldsValue({ receive_dir: res })
    })
  }

  useEffect(() => {
    getLocaleIp()
  }, [getLocaleIp])

  return (
    <Card size="small" title="本机信息" style={{ width: '100%' }}>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={handleFormFinish}
        ref={formRef}
      >
        <Form.Item<IDeviceConfig>
          label="本机IP"
          name="ip"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<IDeviceConfig>
          label="你的昵称"
          name="nickname"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<IDeviceConfig>
          label="设备名称"
          name="device_name"
        >
          <Input readOnly />
        </Form.Item>

        <Form.Item<IDeviceConfig>
          label="保存位置"
        >
          <Space.Compact block style={{ width: '100%' }}>
            <Form.Item<IDeviceConfig>
              name="receive_dir"
            >
              <Input readOnly />
            </Form.Item>
            <Button type="primary" onClick={handleSelectPath}>选择</Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item<IDeviceConfig>
          label="历史记录"
          name="history"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
export default ConfigForm
