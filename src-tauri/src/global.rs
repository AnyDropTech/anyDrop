use tauri::AppHandle;

pub static mut APP_HANDLE: Option<AppHandle> = None;

pub fn set_app_handle(app_handle: AppHandle) {
  unsafe {
    APP_HANDLE = Some(app_handle);
  }
}

pub fn get_app_handle() -> &'static AppHandle {
  try_get_app_handle().expect("Could not get the app handle.")
}

/// Get the static app handle [`APP_HANDLE`].
pub fn try_get_app_handle() -> Option<&'static AppHandle> {
  unsafe { APP_HANDLE.as_ref() }
}