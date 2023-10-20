import type { MenuProps } from 'antd'
import { Button, Dropdown, Space } from 'antd'
import { computed } from 'mobx'
import { observer } from 'mobx-react-lite'

import { FloderIcon, UnkownIcon, WifiIcon } from '../../components'
import { useStore } from '../../store'

import MacIcon from '../../assets/MacBook.svg'

import './sender.scss'

function recever() {
  const items: MenuProps['items'] = [
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
          1st menu item
        </a>
      ),
      key: '0',
    },
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
          2nd menu item
        </a>
      ),
      key: '1',
    },
    {
      type: 'divider',
    },
  ]

  const { receiveFileInfo } = useStore()

  const devices = computed(() => receiveFileInfo.getRecevierFileList).get()

  return (
    <div className="page-transfer">
      <div className="device-list">
        {devices.map((item) => {
          return (
            <div className={['device-item'].join(' ')}>
              <div className="device-item-content">
                <div className="device-item__icon">
                  <img src={MacIcon} alt="icon" />
                </div>
                <div className="device-item-info">
                  <div className="device-item-name">{item.fullname}</div>
                  <div className='device-item-device_name'>{item.device_name}</div>
                </div>
              </div>
              <div className="device-item-files">
                <div className="device-file-container">
                  <div className="file-info">
                    {
                      item.files.map((file) => {
                        return (
                          <div className="file-info-item">
                            <div className="file-icon"><UnkownIcon /></div>
                            <div className="file-name">{file.name}</div>
                          </div>
                        )
                      })
                    }
                    <div className="file-save-info">
                      <div className="file-save-info__icon">
                        <Dropdown menu={{ items }}>
                          <Space>
                            <FloderIcon />
                            <span>Downloads</span>
                          </Space>
                        </Dropdown>
                      </div>
                      <div className="file-total-size">
                        <WifiIcon />
                        <span>116b</span>
                      </div>
                    </div>
                    <div className="file-action">
                      <Button type="primary">接收</Button>
                      <Button type="dashed">拒绝</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default observer(recever)
