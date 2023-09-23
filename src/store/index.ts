import React from 'react'

import DeviceInfo from './device'
import RecevireFileInfo from './recevierFile'

class Store {
  deviceInfo: DeviceInfo
  receiveFileInfo: RecevireFileInfo
  constructor() {
    this.deviceInfo = new DeviceInfo()
    this.receiveFileInfo = new RecevireFileInfo()
  }
}

// 使用context是为了让react识别到Store里面的mobx，不然react不认识Store
const rootStore = new Store()
const context = React.createContext(rootStore)
export const useStore = () => React.useContext(context)
export default () => React.useContext(context)
