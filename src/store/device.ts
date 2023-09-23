import { makeAutoObservable } from 'mobx'

import type { IQueryRes } from '../views/find/types'

class DeviceInfo {
  list: IQueryRes[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setList = (devices: IQueryRes[]) => {
    this.list = devices
    localStorage.setItem('devices_list', JSON.stringify(this.list))
  }
}

export default DeviceInfo
