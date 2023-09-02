import { CloseOutlined, ExpandOutlined, MinusOutlined } from '@ant-design/icons'
import { getCurrent } from '@tauri-apps/plugin-window'
import { Menu, theme } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'

import './default.scss'

const { useToken } = theme
const appWindow = getCurrent()

function DefaultLayout() {
  const { token } = useToken()

  const navigate = useNavigate()

  function navigateTo(path: string) {
    return navigate(path)
  }

  const sidebarItems = [
    {
      key: '1',
      label: '首页',
    },
    {
      key: '2',
      label: '发现',
    },
    {
      key: '3',
      label: '传输',
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

  const handleMinize = () => {
    appWindow.minimize()
  }
  const handleMaximize = () => {
    appWindow.toggleMaximize()
  }

  const handleClose = () => {
    appWindow.close()
  }

  return (
    <div className='page'>
      {/* 统一的头部内容 */}
      <div className="main-header">
        <div className="header-action">
            {/* <img src={LogoImg} alt="" className="action-logo" /> */}
        </div>
        <div data-tauri-drag-region className="titlebar">
          <div className="titlebar-button" id="titlebar-minimize" onClick={handleMinize}>
            <MinusOutlined />
          </div>
          <div className="titlebar-button" id="titlebar-maximize" onClick={handleMaximize}>
            <ExpandOutlined />
          </div>
          <div className="titlebar-button" id="titlebar-close" onClick={handleClose}>
            <CloseOutlined />
          </div>
        </div>
      </div>
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
