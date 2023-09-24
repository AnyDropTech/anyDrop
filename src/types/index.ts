export interface IDeviceConfig {
  ip: string
  id: string
  nickname: string
  device_name: string
  receive_dir: string
  history: boolean
}

export interface ISendMessage {
  type: string
  data: any
}

export interface FileInfoItem {
  name: string
  size: number
  path: string
}
export interface ISendFileInfo {
  ip: string
  id: string
  fullname: string
  device_name: string
  port: number
  files: Array<FileInfoItem>
}
