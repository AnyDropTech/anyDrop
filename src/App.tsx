import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { observer } from 'mobx-react-lite'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import DefaultLayout from './layouts/default'
import Find from './views/find'
import Home from './views/home'
import Transfer from './views/transfer'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          {/* 布局组件 */}
          <Route path="/" element={<DefaultLayout />}>
            {/* Home */}
            <Route index element={<Home />} />
            {/* 发现 */}
            <Route path="find" element={<Find />} />
            {/* 传输 */}
            <Route path="transfer" element={<Transfer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default observer(App)
