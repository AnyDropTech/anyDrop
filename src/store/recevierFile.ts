import { makeAutoObservable } from 'mobx'

import type { ISendFileInfo } from '../types'

class RecevireFileInfo {
  list: ISendFileInfo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setList = (devices: ISendFileInfo) => {
    this.list.push(devices)
    localStorage.setItem('devices_list', JSON.stringify(this.list))
  }
}

export default RecevireFileInfo
