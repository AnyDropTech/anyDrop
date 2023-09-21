import { invoke } from '@tauri-apps/api'
import { Button, Card, Form, Input, message, Space, Switch } from 'antd'
import { useEffect } from 'react'

import type { IDeviceConfig } from '../../types'

function ConfigForm() {
  const [form] = Form.useForm<IDeviceConfig>()
  const initConfig = {} as IDeviceConfig

  // 选择文件夹
  const handleSelectPath = async () => {
    const path = await invoke<string>('select_target_save_dir')
    if (path)
      form.setFieldsValue({ receive_dir: path })
  }

  // 表单提交
  const handleFormFinish = () => {
    const values = form.getFieldsValue()
    invoke('save_client_config', { config: { ...initConfig, ...values } }).then(() => {
      message.success('保存成功')
    }).catch((e) => {
      message.error(e)
    })
  }

  // 获取初始化的配置
  const getInitConfig = () => {
    invoke<IDeviceConfig>('init_client_config').then((res) => {
      form.setFieldsValue(res)
      Object.assign(initConfig, res)
    })
  }

  useEffect(() => {
    getInitConfig()
  }, [getInitConfig])

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
          <Input />
        </Form.Item>
        <Form.Item<IDeviceConfig>
          label="设备名称"
          name="device_name"
        >
          <Input />
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
