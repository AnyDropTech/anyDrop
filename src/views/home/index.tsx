import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, createDir } from '@tauri-apps/plugin-fs'
import type { FormInstance } from 'antd'
import { Button, Card, Form, Input, Space, Switch } from 'antd'
import React, { useEffect } from 'react'

function saveConfig() {
  console.log(BaseDirectory)
  // writeTextFile('app.conf', 'file contents', { dir: BaseDirectory.Document })
  createDir('db', { dir: BaseDirectory.Document })
}

function Home() {
  const formRef = React.useRef<FormInstance>(null)

  const getLocaleIp = async () => {
    const ip = await invoke<string>('get_locale_ip')
    formRef.current?.setFieldsValue({ ip, password: '123456' })
  }

  useEffect(() => {
    getLocaleIp()
    saveConfig()
  })

  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card size="small" title="本机信息" style={{ width: '100%' }}>
            <Form
              name="basic"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              style={{ maxWidth: 600 }}
              initialValues={{ remember: true }}
              autoComplete="off"
              ref={formRef}
            >
              <Form.Item
                label="本机IP"
                name="ip"
              >
                <Input readOnly/>
              </Form.Item>
              <Form.Item
                label="本机传输密码"
                name="password"
              >
                <Input readOnly/>
              </Form.Item>
              <Form.Item
                label="本机可被发现"
                name="receive"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
              </Form.Item>
              <Form.Item
                label="自动接收"
                name="autoReceive"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
              </Form.Item>
              <Form.Item
                label="保存位置"
                name="receiveDir"
              >
                <Space.Compact block style={{ width: '100%' }}>
                  <Input readOnly/>
                  <Button type="primary">选择</Button>
                </Space.Compact>
              </Form.Item>
              <Form.Item
                label="历史记录"
                name="autoReceive"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </div>
  )
}
export default Home
