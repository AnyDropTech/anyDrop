import { useEffect, useState } from 'react'

import { DeleteIcon, PendingIcon, UnkownIcon } from '../../components'
import { useStore } from '../../store'
import type { ISendFileInfo } from '../../types'

import MacIcon from '../../assets/MacBook.svg'

import './sender.scss'

function Sender() {
  const { sendFileInfo } = useStore()

  const [fileList, setFileList] = useState<ISendFileInfo[]>([])
  useEffect(() => {
    console.log(sendFileInfo)
    setFileList(sendFileInfo.getList())
  }, [sendFileInfo])

  const handleDeleteDevice = (index: number) => {
    sendFileInfo.remove(index)
    setFileList(sendFileInfo.getList())
  }
  return (

    <div className="page-recever">
      <div className="device-list">
        {
          fileList.map((item, index) => {
            return <div className={['device-item'].join(' ')} key={`sender${index}`}>
            <div className="device-item-content">
              <div className="device-item__icon">
                <img src={MacIcon} alt="icon" />
                {/* <span className='device-status' style={{ backgroundColor: data.color }}></span> */}
              </div>
              <div className="device-item-info">
                <div className="device-item-name">{item.device_name}</div>
                <div className='device-item-device_name'>{item.fullname}</div>
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
