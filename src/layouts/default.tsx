import { Outlet } from 'react-router-dom'
import { Menu } from 'antd'

import { useNavigate } from 'react-router-dom'

function DefaultLayout() {
  const navigate = useNavigate()

  function navigateTo(path: string) {
    return navigate(path)
  }

  const sidebarItems = [
    {
      key: '1',
      label: 'Home',
    },
    {
      key: '2',
      label: 'Find',
    },
    {
      key: '3',
      label: 'Transfer',
    },
  ]

  function handleMenuClick({ key }: any) {
    switch (key) {
      case '1':
        navigateTo('/')
        break
      case '2':
        navigateTo('/find')
        break
      case '3':
        navigateTo('/transfer')
        break
      default:
        break
    }
  }

  return (
    <>
      {/* 统一的头部内容 */}
      <div className="main-header"></div>
      <div className="main-container">
        {/* 侧边栏 */}
        <div className="main-sidebar">
          <Menu
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
    </>
  )
}

export default DefaultLayout