//! Service daemon for client config.
use std::{fs::{metadata, self}, path::PathBuf};

use rfd::FileDialog;
use tauri::{path::BaseDirectory, Manager, utils::config};
use crate::{error::Result, global::get_app_handle};

pub const SERVICE_TYPE: &str = "_rope._tcp.local.";
pub const PORT: u16 = 17682;

pub const CLIENT_CONFIG_FILE_NAME: &str = "anydrop.config.conf";
/**
 * 客户端配置
 */
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClientConfig {
  pub id: String,
  pub nickname: String,
  pub device_name: String,
  pub password: String,
  pub receive_dir: String,
  pub history: bool
}

impl ClientConfig {
  /**
   * 创建一个新的客户端配置
   */
  pub fn new() -> Result<Self> {
    let uni_id = crate::utils::generate_magic_string();
    let config_path = Self::get_client_config_path();
    let receiver_dir = config_path.clone().into_os_string().to_str().unwrap().to_string();
    let self_data = Self {
      id: uni_id,
      nickname: "".to_string(),
      device_name: "".to_string(),
      password: "".to_string(),
      receive_dir: receiver_dir,
      history: false
    };
    if !metadata(&config_path).is_ok() {
      // 如果配置文件不存在，则创建配置文件
      let config = self_data.clone();
      let config_str = serde_json::to_string(&config).unwrap();
      fs::write(&config_path, config_str).expect("Unable to write file");
    };
    Ok(self_data)
  }

  pub fn get_client_config_path() -> PathBuf {
    get_app_handle().path().resolve(CLIENT_CONFIG_FILE_NAME, BaseDirectory::Document).unwrap().clone()
  }

  /**
   * 文件系统获取客户端配置
   */
  pub fn get_config_from_fs() -> ClientConfig {
    // 从文件系统中读取配置 "anydrop.config.conf"
    let config_path = Self::get_client_config_path();
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

/**
 * 选择文件保存路径
 */
#[tauri::command]
pub fn select_file_save_path() -> String {
  let folder = FileDialog::new().pick_folder();
  let folder = folder.unwrap_or_default();
  String::from(folder.to_str().unwrap_or_default())
}