use tauri::AppHandle;

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