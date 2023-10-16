
pub mod error;
pub mod utils;
pub mod client_global;
pub mod client_config;
pub mod client_connector;
pub mod client_send_recevier;
mod client_command;

use tauri::Manager;

use client_config::ClientConfig;
use client_connector::init_client_connector;
use client_global::{set_global_window, set_app_handle, set_global_client_config};
use client_send_recevier::{init_tcplistener, select_send_dir, select_send_file, send_file_confirmation};

use client_command::{locale_ip, select_target_save_dir};

use crate::client_global::{init_client_config, save_client_config};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_window::init())
    .setup(|app| {

      // 设置全局state
      set_global_window(app.get_window("main").unwrap().clone());
      set_app_handle(app.handle().clone());
      let client_config = ClientConfig::new().unwrap();
      set_global_client_config(client_config);

      // 初始化客户端连接器
      init_client_connector();

      // 初始化tcp链接
      init_tcplistener();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      locale_ip,
      init_client_config,
      save_client_config,
      select_target_save_dir,
      select_send_dir,
      select_send_file,
      send_file_confirmation
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
