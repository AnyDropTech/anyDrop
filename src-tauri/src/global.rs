use tauri::AppHandle;

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

pub fn set_global_client_config(client_config: ClientConfig) {
  unsafe {
    GLOABL_CLIENT_CONFIG = Some(client_config);
  }
}

pub fn get_global_client_config() -> &'static ClientConfig {
  try_get_global_client_config().expect("Could not get the global client config.")
}

pub fn try_get_global_client_config() -> Option<&'static ClientConfig> {
  unsafe { GLOABL_CLIENT_CONFIG.as_ref() }
}