use local_ipaddress;
use rfd::FileDialog;

#[tauri::command]
pub fn select_send_files() {}

#[tauri::command]
pub fn select_target_save_dir() -> String {
  let folder = FileDialog::new().pick_folder();
  let folder = folder.unwrap_or_default();
  String::from(folder.to_str().unwrap_or_default())
}

/**
 * 获取本地ip地址
 */
#[tauri::command]
pub fn locale_ip() -> String {
  local_ipaddress::get().unwrap()
}

#[tauri::command]
fn receiver_files() {}

#[tauri::command]
fn send_files() {}