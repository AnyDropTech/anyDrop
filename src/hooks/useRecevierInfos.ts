import { useRxCollection, useRxData } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const recevierInfosSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  device_name: z.string(),
  port: z.number(),
  files: z.array(z.object({
    name: z.string(),
    size: z.string(),
    path: z.string(),
  })),
})

export type RecevierInfos = z.infer<typeof recevierInfosSchema>

export const recevierInfosFormSchema = recevierInfosSchema.partial({
  id: true,
})

export type recevierInfosForm = z.infer<typeof recevierInfosFormSchema>

export function useReceviderInfos() {
  const { result: recevierInfos } = useRxData<RecevierInfos>('recevierinfos', collection =>
    collection.find(),
  )
  const collection = useRxCollection('recevierinfos')

  const addRecevicerInfo = async (data: recevierInfosForm) => {
    await collection?.insert({
      ...data,
      id: uuidv4(),
    })
  }

  const addAll = async (data: recevierInfosForm[]) => {
    console.log('inner set', data)
    for (let i = 0; i < data.length; i++)
      await addRecevicerInfo(data[i])
  }

  const removeAll = async () => {
    await collection?.remove()
  }

  const deleteRecevierInfoById = async (id: string) => {
    const doc = await collection?.findOne(id)
    await doc?.remove()
  }

  const getAll = async () => {
    return await collection?.find().exec()
  }

  return { recevierInfos, addRecevicerInfo, removeAll, deleteRecevierInfoById, addAll, getAll }
}
