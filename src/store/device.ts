import { makeAutoObservable } from 'mobx'
import { isHydrated, makePersistable } from 'mobx-persist-store'

import type { IQueryRes } from '../views/find/types'

class DeviceInfo {
  devicesList: IQueryRes[] = []

  constructor() {
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'DeviceInfo',
      properties: ['devicesList'],
      storage: window.localStorage,
    })
  }

  setDevicesList(devicesList: IQueryRes[]) {
    // console.log('🚀 ~ file: device.ts:18 ~ DeviceInfo ~ setDevicesList ~ devicesList:', devicesList)
    if (devicesList.length > 0)
      this.devicesList = devicesList
  }

  get getDevicesList() {
    return this.devicesList
  }

  get isHydrated() {
    return isHydrated(this)
  }
}

export default DeviceInfo
