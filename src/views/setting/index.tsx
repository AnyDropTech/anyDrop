import { Space } from 'antd'

import ConfigForm from './ConfigForm'

function Home() {
  return (
    <div className="page-home">
      <div className="page-header">AnyDrop V0.0.1</div>
      <div className="page-content">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <ConfigForm />
        </Space>
      </div>
    </div>
  )
}
export default Home
