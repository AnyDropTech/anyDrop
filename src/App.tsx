import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { RxDatabase } from 'rxdb'
import { Provider } from 'rxdb-hooks'

import { useTheme } from './hooks/useTheme'
import DefaultLayout from './layouts/default'
import Find from './views/find'
import Setting from './views/setting'
import Transfer from './views/transfer'
import Recever from './views/transfer/recever'
import Sender from './views/transfer/sender'
import { anyDropDatabase } from './model'

import './App.css'

function App() {
  const [db, setDb] = useState<RxDatabase>()
  // const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const { currentTheme } = useTheme()

  useEffect(() => {
    anyDropDatabase().then(setDb)
  }, [])
  return (
    <Provider db={db}>
      <ConfigProvider locale={zhCN} theme={{ algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
        <BrowserRouter>
          <Routes>
            {/* 布局组件 */}
            <Route path="/" element={<DefaultLayout />}>
              {/* 发现 */}
              <Route index path="/" element={<Find />} />
              <Route index path="/sender" element={<Sender />} />
              <Route index path="/recever" element={<Recever />} />
              {/* Setting */}
              <Route path='setting' element={<Setting />} />
              {/* 传输 */}
              <Route path="transfer" element={<Transfer />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  )
}

export default observer(App)
