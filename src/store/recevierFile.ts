import { makeAutoObservable } from 'mobx'
import { isHydrated, makePersistable } from 'mobx-persist-store'
import { v4 } from 'uuid'

import type { ISendFileInfo } from '../types'

class RecevireFileInfo {
  recevierFileList: ISendFileInfo[] = []

  constructor() {
    makeAutoObservable(this)
    makePersistable(this, {
      name: 'recevierFileList',
      properties: ['recevierFileList'],
      storage: window.localStorage,
    })
  }

  insert(item: ISendFileInfo) {
    this.recevierFileList.push({
      ...item,
      id: v4(),
    })
  }

  insertAll(items: ISendFileInfo[]) {
    this.recevierFileList.push(...items.map(item => ({
      ...item,
      id: v4(),
    })))
  }

  update(id: string, data: Partial<ISendFileInfo>) {
    const index = this.recevierFileList.findIndex(item => item.id === id)
    if (index !== -1) {
      this.recevierFileList[index] = {
        ...this.recevierFileList[index],
        ...data,
      }
    }
  }

  remove = (index: number) => {
    const item = this.recevierFileList.splice(index, 1)
    return item ? item[0] : null
  }

  get getRecevierFileList() {
    return this.recevierFileList
  }

  get isHydrated() {
    return isHydrated(this)
  }
}

export default RecevireFileInfo
