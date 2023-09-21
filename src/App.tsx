import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { observer } from 'mobx-react-lite'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import DefaultLayout from './layouts/default'
import Find from './views/find'
import Setting from './views/setting'
import Transfer from './views/transfer'

import './App.css'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 布局组件 */}
          <Route path="/" element={<DefaultLayout />}>
            {/* 发现 */}
            <Route index path="/" element={<Find />} />
            {/* Setting */}
            <Route path='setting' element={<Setting />} />
            {/* 传输 */}
            <Route path="transfer" element={<Transfer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default observer(App)
