import type { Platfrom } from "../../utils";

export interface IDevice {
  platform: Platfrom;
  nickname: string;
  deviceName: string;
  color: string
}