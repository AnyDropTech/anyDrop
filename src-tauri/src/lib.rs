
mod client_command;
pub mod error;
pub mod client_config;
pub mod client_connector;
pub mod global;
pub mod utils;

use global::set_app_handle;

use crate::client_command::{locale_ip, select_target_save_dir};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .setup(|app| {
      // 设置全局state
      set_app_handle(app.handle().clone());
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      locale_ip,
      select_target_save_dir
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
