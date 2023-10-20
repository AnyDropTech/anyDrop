import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { observer } from 'mobx-react-lite'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { useTheme } from './hooks/useTheme'
import DefaultLayout from './layouts/default'
import Find from './views/find'
import Setting from './views/setting'
import Transfer from './views/transfer'
import Recever from './views/transfer/recever'
import Sender from './views/transfer/sender'

import './App.css'

import 'mobx-react-lite/batchingForReactDom'

function App() {
  const { currentTheme } = useTheme()
  return (
      <ConfigProvider locale={zhCN} theme={{ algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <BrowserRouter>
          <Routes>
            {/* 布局组件 */}
            <Route path="/" element={<DefaultLayout />}>
              {/* 发现 */}
              <Route index path='/' element={<Find />} />
              <Route path="/sender" element={<Sender />} />
              <Route path="/recever" element={<Recever />} />
              {/* Setting */}
              <Route path='/setting' element={<Setting />} />
              {/* 传输 */}
              <Route path="/transfer" element={<Transfer />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
  )
}

export default observer(App)
