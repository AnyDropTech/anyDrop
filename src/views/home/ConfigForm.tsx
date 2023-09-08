import { downloadDir } from '@tauri-apps/api/path'
import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { hostname, platform } from '@tauri-apps/plugin-os'
import type { FormInstance } from 'antd'
import { Button, Card, Form, Input, Space, Switch } from 'antd'
import React, { useCallback, useEffect } from 'react'

import { randomNum, uuid } from '../../utils'

interface FormData {
  ip: string
  nickname: string
  deviceName: string
  password: string
  receive: boolean
  autoReceive: boolean
  receiveDir: string
  history: boolean
}

async function saveConfig(config: FormData) {
  await writeTextFile('app.conf', JSON.stringify(config), { dir: BaseDirectory.AppConfig })
  readTextFile('app.conf', { dir: BaseDirectory.AppConfig }).then((res) => {
    console.log(res)
  })
}

function ConfigForm() {
  const [form] = Form.useForm<FormData>()
  const formRef = React.useRef<FormInstance>(null)

  const getLocaleIp = useCallback(async () => {
    const ip = await invoke<string>('get_locale_ip')

    const hostName = await hostname()
    console.log('🚀 ~ file: ConfigForm.tsx:35 ~ getLocaleIp ~ hostName:', hostName)

    const password = uuid()
    const nickname = `AnyDrop_${randomNum(4).toString()}`
    // const dirName = await createDir('AnyDropFiles', { dir: BaseDirectory.Download })
    const dirName = await downloadDir()
    const _platform = await platform()
    console.log('🚀 ~ file: ConfigForm.tsx:43 ~ getLocaleIp ~ dirName:', `${dirName}/AnyDropFiles`)
    form.setFieldsValue({ ip, deviceName: hostName || '', password, nickname, receiveDir: `${dirName}${_platform === 'windows' ? '\\' : '/'}AnyDropFiles` })
  }, [])

  const handleFormFinish = (values: FormData) => {
    saveConfig(values)
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
          <Input readOnly/>
        </Form.Item>
        <Form.Item<FormData>
          label="你的昵称"
          name="nickname"
        >
          <Input readOnly/>
        </Form.Item>
        <Form.Item<FormData>
          label="设备名称"
          name="deviceName"
        >
          <Input readOnly/>
        </Form.Item>
        <Form.Item<FormData>
          label="本机传输密码"
          name="password"
        >
          <Input readOnly/>
        </Form.Item>
        <Form.Item<FormData>
          label="本机可被发现"
          name="receive"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
        </Form.Item>
        <Form.Item<FormData>
          label="自动接收"
          name="autoReceive"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
        </Form.Item>
        <Form.Item<FormData>
          label="保存位置"
          name="receiveDir"
        >
          <Space.Compact block style={{ width: '100%' }}>
            <Input readOnly/>
            {/* <Button type="primary">选择</Button> */}
          </Space.Compact>
        </Form.Item>
        <Form.Item<FormData>
          label="历史记录"
          name="autoReceive"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
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
