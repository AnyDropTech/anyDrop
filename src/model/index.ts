import { addRxPlugin, createRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

// 开发模式
addRxPlugin(RxDBDevModePlugin)
// 查询构建器
addRxPlugin(RxDBQueryBuilderPlugin)

export async function anyDropDatabase() {
  const db = await createRxDatabase({
    name: 'reactrxdb',
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
  })

  await db.addCollections({
    notes: {
      schema: {
        title: 'notes',
        version: 0,
        type: 'object',
        primaryKey: 'id',
        properties: {
          id: {
            type: 'string',
            maxLength: 250,
          },
          uid: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          content: {
            type: 'string',
          },
          timestamp: {
            type: 'date-time',
          },
        },
        required: ['uid', 'title', 'content'],
      },
    },
  })
  return db
}
