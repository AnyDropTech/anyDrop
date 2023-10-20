import { makeAutoObservable } from 'mobx'
import { isHydrated, makePersistable } from 'mobx-persist-store'
import { v4 } from 'uuid'

import type { ISendFileInfo } from '../types'

class SendFileInfo {
  senderFileList: ISendFileInfo[] = []

  constructor() {
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'senderFileList',
      properties: ['senderFileList'],
      storage: window.localStorage,
    })
  }

  insert(item: ISendFileInfo) {
    this.senderFileList.push({
      ...item,
      id: v4(),
    })
  }

  update(id: string, data: Partial<ISendFileInfo>) {
    const index = this.senderFileList.findIndex(item => item.id === id)
    if (index !== -1) {
      this.senderFileList[index] = {
        ...this.senderFileList[index],
        ...data,
      }
    }
  }

  remove = (index: number) => {
    const item = this.senderFileList.splice(index, 1)
    return item ? item[0] : null
  }

  get getSenderFileList() {
    return this.senderFileList
  }

  get isHydrated() {
    return isHydrated(this)
  }
}

export default SendFileInfo
