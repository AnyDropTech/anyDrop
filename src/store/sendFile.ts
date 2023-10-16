import { makeAutoObservable } from 'mobx'

import type { ISendFileInfo } from '../types'

class SendFileInfo {
  list: ISendFileInfo[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setList = (devices: ISendFileInfo) => {
    this.list.push(devices)
    this.saveList(this.list)
  }

  saveList = (list: ISendFileInfo[]) => {
    this.list = list
    localStorage.setItem('send_file_list', JSON.stringify(this.list))
  }

  remove = (index: number) => {
    const item = this.list.splice(index, 1)
    this.saveList(this.list)
    return item ? item[0] : null
  }

  getList = () => {
    if (this.list.length > 0)
      return this.list
    const list = localStorage.getItem('send_file_list')
    if (list)
      this.list = JSON.parse(list)

    return this.list
  }
}

export default SendFileInfo
