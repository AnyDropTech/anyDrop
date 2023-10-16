import { useRxCollection, useRxData } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const senderInfosSchema = z.object({
  id: z.string(),
  ip: z.string(),
  fullname: z.string(),
  device_name: z.string(),
  port: z.number(),
  files: z.array(z.object({
    name: z.string(),
    size: z.string(),
    path: z.string(),
  })),
})

export type SenderInfos = z.infer<typeof senderInfosSchema>

export const senderInfosFormSchema = senderInfosSchema.partial({
  id: true,
})

export type senderInfosForm = z.infer<typeof senderInfosFormSchema>

export function useSenderInfos() {
  const { result: senderInfos } = useRxData<SenderInfos>('senderinfos', collection =>
    collection.find(),
  )
  const collection = useRxCollection<SenderInfos>('senderinfos')

  const addSenderInfo = async (data: senderInfosForm) => {
    await collection?.insert({
      ...data,
      id: uuidv4(),
    })
  }

  const addAll = async (data: senderInfosForm[]) => {
    console.log('inner set', data)
    for (let i = 0; i < data.length; i++)
      await addSenderInfo(data[i])
  }

  const removeAll = async () => {
    const res = await collection?.find({})
    console.log('remove all', res)
    const deleteRes = await res?.remove()
    console.log('🚀 ~ file: useSenderInfos.ts:49 ~ removeAll ~ deleteRes:', deleteRes)
    return deleteRes
  }

  const deleteSenderInfoById = async (id: string) => {
    const doc = await collection?.findOne(id)
    await doc?.remove()
  }

  const getAll = async () => {
    return await collection?.find().exec()
  }

  return { senderInfos, addSenderInfo, removeAll, deleteSenderInfoById, addAll, getAll }
}
