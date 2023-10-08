import React from 'react'

import DeviceInfo from './device'
import RecevireFileInfo from './recevierFile'
import SendFileInfo from './sendFile'

class Store {
  deviceInfo: DeviceInfo
  receiveFileInfo: RecevireFileInfo
  sendFileInfo: SendFileInfo
  constructor() {
    this.deviceInfo = new DeviceInfo()
    this.receiveFileInfo = new RecevireFileInfo()
    this.sendFileInfo = new SendFileInfo()
  }
}

// 使用context是为了让react识别到Store里面的mobx，不然react不认识Store
const rootStore = new Store()
const context = React.createContext(rootStore)
export const useStore = () => React.useContext(context)
export default () => React.useContext(context)
