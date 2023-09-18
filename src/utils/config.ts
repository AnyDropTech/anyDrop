import { BaseDirectory, homeDir } from '@tauri-apps/api/path'
import { metadata, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'

import type { IDeviceConfig } from '../types'

async function saveConfig(config: IDeviceConfig) {
  await writeTextFile('anydrop.config.conf', JSON.stringify(config), { dir: BaseDirectory.Home })
}

async function checkConfig() {
  try {
    const appConfigPath = await homeDir()
    const configFilePath = `${appConfigPath}/anydrop.config.conf`
    const meta = await metadata(configFilePath)
    return meta.permissions.readonly === false
  }
  catch (error) {
    return false
  }
}

async function getConfig() {
  const checkRef = await checkConfig()
  if (checkRef) {
    const saveContent = await readTextFile('anydrop.config.conf', { dir: BaseDirectory.Home })
    const config = (() => {
      try {
        return JSON.parse(saveContent)
      }
      catch (error) {
        return null
      }
    })()
    return config
  }
  return null
}
export { checkConfig, getConfig, saveConfig }
