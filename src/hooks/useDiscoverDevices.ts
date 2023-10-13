import { useRxCollection, useRxData } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

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
  const { result: discoverDevices } = useRxData<DiscoverDevices>('discoverdevices', collection =>
    collection.find(),
  )
  const collection = useRxCollection('discoverdevices')

  const addDiscoveryDevice = async (data: discoverDevicesForm) => {
    await collection?.insert({
      id: uuidv4(),
      ...data,
    })
  }

  const addAll = async (data: discoverDevicesForm[]) => {
    console.log('inner set', data)
    for (let i = 0; i < data.length; i++)
      await addDiscoveryDevice(data[i])
  }

  const removeAll = async () => {
    await collection?.find().remove()
  }

  const deleteDiscoverDeviceById = async (id: string) => {
    const doc = await collection?.findOne(id)
    await doc?.remove()
  }

  const getAll = async () => {
    return await collection?.find().exec()
  }

  return { discoverDevices, addDiscoveryDevice, removeAll, deleteDiscoverDeviceById, addAll, getAll }
}
