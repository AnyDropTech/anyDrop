//! Service daemon for client config.
use std::fs::{metadata, self};

use tauri::{path::BaseDirectory, Manager};
use crate::{error::Result, global::get_app_handle};

pub const SERVICE_TYPE: &str = "_rope._tcp.local.";
pub const PORT: u16 = 17682;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClientConfig {
  id: String,
  nickname: String,
  device_name: String,
  password: String,
  receive: bool,
  auto_receive: bool,
  receive_dir: String,
  history: bool
}

impl ClientConfig {
  pub fn new() -> Result<Self> {
    let uni_id = crate::utils::generate_magic_string();
    Ok(Self {
      id: uni_id,
      nickname: "".to_string(),
      device_name: "".to_string(),
      password: "".to_string(),
      receive: false,
      auto_receive: false,
      receive_dir: "".to_string(),
      history: false
    })
  }

  pub fn get_config_from_fs() -> ClientConfig {
    // 从文件系统中读取配置 "anydrop.config.conf"
    let config_path = get_app_handle().path().resolve("anydrop.config.conf", BaseDirectory::Download).unwrap().clone();
    if !metadata(&config_path).is_ok() {
      // 如果配置文件不存在，则创建配置文件
      let config = ClientConfig::new().unwrap();
      let config_str = serde_json::to_string(&config).unwrap();
      fs::write(&config_path, config_str).expect("Unable to write file");
    }
    let config = fs::read_to_string(&config_path)
      .expect("Something went wrong reading the file");
    let config: ClientConfig = serde_json::from_str(&config).unwrap();

    config
  }
}