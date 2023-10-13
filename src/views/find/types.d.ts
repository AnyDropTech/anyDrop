import type { Platfrom } from "../../utils";

export interface IDevice {
  platform: Platfrom;
  nickname: string;
  device_name: string;
  color: string
  receive: string
  history: string
  auto_receive: string
  receive_dir: string
  password: string
}

export interface IQueryRes {
  id: string
  data: IDevice
  offline: boolean
  fullname: string
  hostname: string
  ip_addrs: string[]
  port: number
}