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
}

export interface IQueryRes {
  data: IDevice
  fullname: string
  host_name: string
  ip_addrs: string[]
  port: number
}