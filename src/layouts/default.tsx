import { Menu, theme } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'

import './default.scss'

const { useToken } = theme

function DefaultLayout() {
  const { token } = useToken()

  const navigate = useNavigate()

  function navigateTo(path: string) {
    return navigate(path)
  }

  const sidebarItems = [
    {
      key: '1',
      label: '发现',
    },
    {
      key: '2',
      label: '发送',
    },
    {
      key: '3',
      label: '接收',
    },
    {
      key: '4',
      label: '设置',
    },
  ]

  function handleMenuClick({ key }: any) {
    switch (key) {
      case '1':
        navigateTo('/find')
        break
      case '2':
        navigateTo('/send')
        break
      case '3':
        navigateTo('/reciver')
        break
      case '4':
        navigateTo('/setting')
        break
      default:
        break
    }
  }

  return (
    <div className='page'>
      {/* 统一的头部内容 */}
      <div className="main-header"></div>
      <div className="main-container">
        {/* 侧边栏 */}
        <div className="main-sidebar">
          <div className='main-logo' style={{ background: token.colorBgContainer, color: token.colorPrimaryActive }}>AnyDrop</div>
          <Menu
          className='sidebar-menu'
            mode="vertical"
            defaultSelectedKeys={['1']}
            items={sidebarItems}
            onClick={handleMenuClick}
          />
        </div>
        {/* 内容渲染区域 */}
        <div className="main-page">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout
