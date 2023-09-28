import { makeAutoObservable } from 'mobx'

import type { IQueryRes } from '../views/find/types'

class DeviceInfo {
  onlineList: IQueryRes[] = []
  offlineList: IQueryRes[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setOnloneList = (devices: IQueryRes[]) => {
    this.onlineList = devices
    localStorage.setItem('devices_online_list', JSON.stringify(this.onlineList))
  }

  setOfflineList = (devices: IQueryRes[]) => {
    this.offlineList = devices
    localStorage.setItem('devices_offline_list', JSON.stringify(this.offlineList))
  }

  getOnlineList = () => {
    if (this.onlineList.length > 0)
      return this.onlineList
    const list = localStorage.getItem('devices_online_list')
    if (list)
      this.onlineList = JSON.parse(list)

    return this.onlineList
  }

  getOfflineList = () => {
    if (this.offlineList.length > 0)
      return this.offlineList
    const list = localStorage.getItem('devices_offline_list')
    if (list)
      this.offlineList = JSON.parse(list)

    return this.offlineList
  }
}

export default DeviceInfo
