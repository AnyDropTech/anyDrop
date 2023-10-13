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
    name: 'anydroprxdb',
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

  await db.addCollections({
    discoverdevices: {
      schema: {
        title: 'discoverdevices',
        version: 0,
        type: 'object',
        primaryKey: 'id',
        properties: {
          id: {
            type: 'string',
            maxLength: 250,
          },
          fullname: {
            type: 'string',
          },
          hostname: {
            type: 'string',
          },
          offline: {
            type: 'boolean',
          },
          ip_addrs: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          data: {
            type: 'object',
            items: {
              type: 'object',
              properties: {
                device_name: {
                  type: 'string',
                },
                nickname: {
                  type: 'string',
                },
                password: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['uid', 'fullname', 'offline', 'data.device_name', 'data.nickname', 'data.password'],
      },
    },
  })
  return db
}
