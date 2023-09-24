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

  getList = () => {
    if (this.list.length > 0)
      return this.list
    const list = localStorage.getItem('devices_list')
    if (list)
      this.list = JSON.parse(list)

    return this.list
  }
}

export default RecevireFileInfo
