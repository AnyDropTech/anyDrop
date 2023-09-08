import type { Platfrom } from "../../utils";

export interface IDevice {
  platform: Platfrom;
  nickname: string;
  deviceName: string;
  color: string
}

export interface IQueryRes {
  data: IDevice
  fullname: string
  hostname: string
  ip_addrs: string[]
  port: number
}