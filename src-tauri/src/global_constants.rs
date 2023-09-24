use tauri::{AppHandle, Window};

use crate::client_config::ClientConfig;

/**
 * 全局变量 app_handle
 */
pub static mut APP_HANDLE: Option<AppHandle> = None;

/**
 *  设置全局变量 app_handle
 */
pub fn set_app_handle(app_handle: AppHandle) {
  unsafe {
    APP_HANDLE = Some(app_handle);
  }
}

/**
 * 获取全局变量 app_handle
 */
pub fn get_app_handle() -> &'static AppHandle {
  try_get_app_handle().expect("Could not get the app handle.")
}

/// Get the static app handle [`APP_HANDLE`].
pub fn try_get_app_handle() -> Option<&'static AppHandle> {
  unsafe { APP_HANDLE.as_ref() }
}

// 全局配置
pub static mut GLOABL_CLIENT_CONFIG: Option<ClientConfig> = None;
// 设置全局配置
pub fn set_global_client_config(client_config: ClientConfig) {
  unsafe {
    GLOABL_CLIENT_CONFIG = Some(client_config);
  }
}
// 获取全局变量
pub fn get_global_client_config() -> &'static ClientConfig {
  try_get_global_client_config().expect("Could not get the global client config.")
}
// 获取全局变量
pub fn try_get_global_client_config() -> Option<&'static ClientConfig> {
  unsafe { GLOABL_CLIENT_CONFIG.as_ref() }
}
// 获取全局变量注入js
#[tauri::command]
pub fn init_client_config() -> ClientConfig {
  let config = get_global_client_config();
  config.clone()
}
// 保存全局变量注入js
#[tauri::command]
pub fn save_client_config(config: ClientConfig) {
  set_global_client_config(config)
}


// 全局窗口
pub static mut GLOBAL_WINDOW: Option<Window> = None;
// 设置全局窗口
pub fn set_global_window(window: Window) {
  unsafe {
    GLOBAL_WINDOW = Some(window);
  }
}
// 获取全局窗口
pub fn get_global_window() -> &'static Window {
  try_get_global_window().expect("Could not get the global window.")
}
// 获取全局窗口
pub fn try_get_global_window() -> Option<&'static Window> {
  unsafe { GLOBAL_WINDOW.as_ref() }
}