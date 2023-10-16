import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

// 开发模式
addRxPlugin(RxDBDevModePlugin)
// 查询构建器
addRxPlugin(RxDBQueryBuilderPlugin)

export async function anyDropDatabase() {
  removeRxDatabase('anydroprxdb', getRxStorageDexie())
  removeRxDatabase('reactrxdb', getRxStorageDexie())
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
        required: ['id', 'fullname', 'offline', 'data.device_name', 'data.nickname', 'data.password'],
      },
    },
  })

  await db.addCollections({
    senderinfos: {
      schema: {
        title: 'senderinfos',
        version: 0,
        type: 'object',
        primaryKey: 'id',
        properties: {
          id: {
            type: 'string',
            maxLength: 250,
          },
          ip: {
            type: 'string',
          },
          port: {
            type: 'number',
          },
          device_name: {
            type: 'string',
          },
          nickname: {
            type: 'string',
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                size: {
                  type: 'string',
                },
                path: {
                  type: 'string',
                },
                ext: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['id', 'ip', 'port', 'device_name', 'nickname', 'files', 'files.name', 'files.size', 'files.path'],
      },

    },
  })

  await db.addCollections({
    recevierinfos: {
      schema: {
        title: 'recevierinfos',
        version: 0,
        type: 'object',
        primaryKey: 'id',
        properties: {
          id: {
            type: 'string',
            maxLength: 250,
          },
          ip: {
            type: 'string',
          },
          port: {
            type: 'number',
          },
          device_name: {
            type: 'string',
          },
          nickname: {
            type: 'string',
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                size: {
                  type: 'string',
                },
                path: {
                  type: 'string',
                },
                ext: {
                  type: 'string',
                },
              },
            },
          },
        },
        required: ['id', 'ip', 'port', 'device_name', 'nickname', 'files', 'files.name', 'files.size', 'files.path'],
      },

    },
  })
  return db
}
