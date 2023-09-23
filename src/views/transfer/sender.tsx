import { DeleteIcon, FloderIcon, PendingIcon, UnkownIcon, WifiIcon } from '../../components'

import MacIcon from '../../assets/MacBook.svg'

import './sender.scss'
import { Button } from 'antd'

interface IProps {
  data: {
    nickname: string
    device_name: string
  }
}

function Sender(props: IProps) {
  return (

    <div className="page-recever">
      <div className="device-list">
        <div className={['device-item'].join(' ')}>
          <div className="device-item-content">
            <div className="device-item__icon">
              <img src={MacIcon} alt="icon" />
              {/* <span className='device-status' style={{ backgroundColor: data.color }}></span> */}
            </div>
            <div className="device-item-info">
              <div className="device-item-name">mac book</div>
              <div className='device-item-device_name'>full cavin</div>
            </div>
          </div>
          <div className="device-item-files">
            <div className="device-file-container">
              <div className="file-info">
                <div className="file-info-item">
                  <div className="file-icon"><UnkownIcon /></div>
                  <div className="file-name">sdsdsadasdsadsadsadsadsa.ext</div>
                </div>
                <div className="file-status-content">
                  <div className="file-status-icon">
                    <PendingIcon />
                  </div>
                  <div className="file-status-box">
                    <div className="file-status-title">等待对方接收</div>
                    <div className="file-status-desc">等待对方设备链接接收</div>
                  </div>
                  <div className="file-remove"><DeleteIcon /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={['device-item'].join(' ')}>
          <div className="device-item-content">
            <div className="device-item__icon">
              <img src={MacIcon} alt="icon" />
              {/* <span className='device-status' style={{ backgroundColor: data.color }}></span> */}
            </div>
            <div className="device-item-info">
              <div className="device-item-name">mac book</div>
              <div className='device-item-device_name'>full cavin</div>
            </div>
          </div>
          <div className="device-item-files">
            <div className="device-file-container">
              <div className="file-info">
                <div className="file-info-item">
                  <div className="file-icon"><UnkownIcon /></div>
                  <div className="file-name">sdsdsadasdsadsadsadsadsa.ext</div>
                </div>
                <div className="file-status-content">
                  <div className="file-status-icon">
                    <PendingIcon />
                  </div>
                  <div className="file-status-box">
                    <div className="file-status-title">等待对方接收</div>
                    <div className="file-status-desc">等待对方设备链接接收</div>
                  </div>
                  <div className="file-remove"><DeleteIcon /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sender
