import { observer } from 'mobx-react-lite'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import zhCN from 'antd/locale/zh_CN'
import { ConfigProvider } from 'antd'
import DefaultLayout from './layouts/default'
import Home from './views/home'
import Find from './views/find'
import Transfer from './views/transfer'

function App() {
  return(
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