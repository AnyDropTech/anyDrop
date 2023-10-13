import { useRxCollection, useRxData } from 'rxdb-hooks'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const noteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
})
export type Note = z.infer<typeof noteSchema>

export const noteFormSchema = noteSchema.partial({
  id: true,
})
export type AddNoteForm = z.infer<typeof noteFormSchema>

export function useNotes() {
  const { result: notes } = useRxData<Note>('notes', collection =>
    collection.find(),
  )
  const collection = useRxCollection('notes')

  const addNote = async (title: string, content: string) => {
    await collection?.insert({
      id: uuidv4(),
      title,
      content,
    })
  }

  const deleteNote = async (id: string) => {
    const noteDoc = await collection?.findOne(id)
    await noteDoc?.remove()
  }

  return { notes, addNote, deleteNote }
}
