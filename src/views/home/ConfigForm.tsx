import { downloadDir, homeDir } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, metadata, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { hostname, platform } from '@tauri-apps/plugin-os'
import type { FormInstance } from 'antd'
import { Button, Card, Form, Input, Space, Switch } from 'antd'
import React, { useCallback, useEffect } from 'react'

import { randomNum, uuid } from '../../utils'

interface FormData {
  ip: string
  nickname: string
  device_name: string
  password: string
  receive: boolean
  auto_receive: boolean
  receive_dir: string
  history: boolean
}

async function saveConfig(config: FormData) {
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
  const [form] = Form.useForm<FormData>()
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

        const password = uuid()
        const nickname = `AnyDrop_${randomNum(4).toString()}`
        const dirName = await downloadDir()
        const _platform = await platform()
        form.setFieldsValue({ ip, device_name: hostName || '', password, nickname, receive_dir: `${dirName}${_platform === 'windows' ? '\\' : '/'}AnyDropFiles`, auto_receive: true, receive: true, history: true })
      }
    }
    else {
      const hostName = await hostname()

      const password = uuid()
      const nickname = `AnyDrop_${randomNum(4).toString()}`
      // const dirName = await createDir('AnyDropFiles', { dir: BaseDirectory.Download })
      const dirName = await downloadDir()
      const _platform = await platform()
      form.setFieldsValue({ ip, device_name: hostName || '', password, nickname, receive_dir: `${dirName}${_platform === 'windows' ? '\\' : '/'}AnyDropFiles`, auto_receive: true, receive: true, history: true })
    }

    if (!checkRef) {
      const config = form.getFieldsValue()
      console.log("🚀 ~ file: ConfigForm.tsx:85 ~ getLocaleIp ~ config:", config)
      await saveConfig(config)
    }
  }, [])

  const handleFormFinish = (values: FormData) => {
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
        <Form.Item<FormData>
          label="本机IP"
          name="ip"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<FormData>
          label="你的昵称"
          name="nickname"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<FormData>
          label="设备名称"
          name="device_name"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<FormData>
          label="本机传输密码"
          name="password"
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item<FormData>
          label="本机可被发现"
          name="receive"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
        <Form.Item<FormData>
          label="自动接收"
          name="auto_receive"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
        <Form.Item<FormData>
          label="保存位置"
        >
          <Space.Compact block style={{ width: '100%' }}>
            <Form.Item<FormData>
              name="receive_dir"
            >
              <Input readOnly />
            </Form.Item>
            <Button type="primary" onClick={handleSelectPath}>选择</Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item<FormData>
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
