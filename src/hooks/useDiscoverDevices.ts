import type { RxDocumentData } from 'rxdb'
import { useRxCollection, useRxData } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { sleep } from '../utils'

const discoverDevicesSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  hostname: z.string(),
  offline: z.boolean(),
  ip_addrs: z.array(z.string()),
  port: z.number(),
  data: z.object({
    device_name: z.string(),
    nickname: z.string(),
    password: z.string(),
  }),
})
export type DiscoverDevices = z.infer<typeof discoverDevicesSchema>

export const discoverDevicesFormSchema = discoverDevicesSchema.partial({
  id: true,
})
export type discoverDevicesForm = z.infer<typeof discoverDevicesFormSchema>

export function useDiscoverDevices() {
  const { result: discoverDevices, isFetching } = useRxData<DiscoverDevices>('discoverdevices', collection =>
    collection.find(),
  )
  const collection = useRxCollection<DiscoverDevices>('discoverdevices')

  const addDiscoveryDevice = async (data: discoverDevicesForm) => {
    await collection?.insert({
      id: uuidv4(),
      ...data,
    })
  }

  const addAll = async (data: discoverDevicesForm[]) => {
    return await collection?.bulkInsert(data.map(d => ({ id: uuidv4(), ...d })))
  }

  const removeAll = async () => {
    const res = await collection?.find({})
    console.log('🚀 ~ file: useDiscoverDevices.ts:46 ~ removeAll ~ res:', res)
    const deleteRes = await res?.remove()
    console.log('🚀 ~ file: useDiscoverDevices.ts:48 ~ removeAll ~ deleteRes:', deleteRes)
    return deleteRes
  }

  const insertUnique = async (data: discoverDevicesForm[]) => {
    console.log('🚀 ~ file: useDiscoverDevices.ts:52 ~ insertUnique ~ data:', data)
    await sleep(2000)
    const res = await collection?.find({
      selector: {
        fullname: {
          $in: data.map(d => d.fullname),
        },
      },
    }).exec()
    const saveData: discoverDevicesForm[] = []
    data.forEach((d) => {
      if (!res?.find(r => r.fullname === d.fullname))
        saveData.push(d)
    })
    console.log('res=>', res)
    console.log('saveData=>', saveData)
    if (saveData.length > 0)
      return await collection?.bulkInsert(saveData.map(d => ({ id: uuidv4(), ...d })))
  }

  const deleteDiscoverDeviceById = async (id: string) => {
    const doc = await collection?.findOne(id)
    await doc?.remove()
  }

  const getAll = async () => {
    const res = await collection?.find({
      selector: {
        fullname: { $not: '' },
      },
    })
    console.log(collection)
    return res
  }

  const onInsertEvent = (callback: (docData: RxDocumentData<DiscoverDevices>) => void) => {
    return collection?.insert$.subscribe((event) => {
      const { documentData } = event
      callback(documentData)
    })
  }

  console.log('🚀 ~ file: useDiscoverDevices.ts:52 ~ insertUnique ~ data:', discoverDevices)

  return { isFetching, discoverDevices, addDiscoveryDevice, removeAll, deleteDiscoverDeviceById, addAll, getAll, insertUnique, onInsertEvent }
}
