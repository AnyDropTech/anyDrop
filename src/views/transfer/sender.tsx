import { Empty } from 'antd'
import { computed } from 'mobx'
import { observer } from 'mobx-react-lite'

import { DeleteIcon, PendingIcon, UnkownIcon } from '../../components'
import { useStore } from '../../store'

import MacIcon from '../../assets/MacBook.svg'

import './sender.scss'

function Sender() {
  const { sendFileInfo } = useStore()

  const senderFileList = computed(() => sendFileInfo.getSenderFileList).get()

  const handleDeleteDevice = (index: number) => {
    sendFileInfo.remove(index)
  }
  return (
    <div className="page-recever">
      <div className="device-list">
        {
          senderFileList.map((item, index) => {
            return <div className={['device-item'].join(' ')} key={`sender${index}`}>
            <div className="device-item-content">
              <div className="device-item__icon">
                <img src={MacIcon} alt="icon" />
                {/* <span className='device-status' style={{ backgroundColor: data.color }}></span> */}
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
                    item.files.map((file, idx) => {
                      return <div className="file-info-item" key={`file${idx}`}>
                        <div className="file-icon"><UnkownIcon /></div>
                        <div className="file-name">{file.name}</div>
                      </div>
                    })
                  }
                  <div className="file-status-content">
                    <div className="file-status-icon">
                      <PendingIcon />
                    </div>
                    <div className="file-status-box">
                      <div className="file-status-title">等待对方接收</div>
                      <div className="file-status-desc">等待对方设备链接接收</div>
                    </div>
                    <div className="file-remove" onClick={() => handleDeleteDevice(index)}><DeleteIcon /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          })
        }
        {
          senderFileList.length === 0
            ? <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 60 }}
          description={
            <span>
              暂无文件
            </span>
          }
        />
            : null
        }
      </div>
    </div>
  )
}

export default observer(Sender)
