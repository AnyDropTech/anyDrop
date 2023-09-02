import { invoke } from '@tauri-apps/api/tauri'
import type { FormInstance } from 'antd'
import { Card, Form, Input, Space } from 'antd'
import React, { useEffect } from 'react'

function Home() {
  const formRef = React.useRef<FormInstance>(null)

  const getLocaleIp = async () => {
    const ip = await invoke<string>('get_locale_ip')
    formRef.current?.setFieldsValue({ ip })
  }

  useEffect(() => {
    getLocaleIp()
  })

  return (
    <div className="page-home">
      <div className="page-header">Header</div>
      <div className="page-content">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card size="small" title="本机信息" style={{ width: '100%' }}>
        <Form
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          autoComplete="off"
          ref={formRef}
        >
          <Form.Item
            label="本机IP"
            name="ip"
          >
            <Input />
          </Form.Item>
          </Form>
        </Card>
      </Space>
      </div>
    </div>
  )
}
export default Home
