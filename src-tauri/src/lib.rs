mod discovery;
mod send;
use std::fs::metadata;
use local_ipaddress;
use tauri::{Window, Runtime};

use rfd::FileDialog;

use discovery::{register_service, ClientDevice, query_handler, unregister, PORT};
use send::send_file;
use tokio::sync::oneshot;

#[tauri::command]
fn start_discovery_command() {
  // register_service();
}

#[tauri::command]
fn get_user_savepath() -> String {
  let folder = FileDialog::new().pick_folder();
  let folder = folder.unwrap_or_default();
  String::from(folder.to_str().unwrap_or_default())
}

#[tauri::command]
fn start_broadcast_command(data: ClientDevice)  {
  println!("++++++++++++++++data: {:?}", data);
  let _res = register_service(data);

  format!("{}", "success");
}

#[tauri::command]
fn unregister_service(password: &str)  {
  println!("++++++++++++++++data: {:?}", password);
  let _res = unregister(password);

  format!("{}", "success");
}

#[tauri::command]
fn query_service(window: Window, password: &str) -> String {
  query_handler(window, password);
  let a = "success".to_string();
  a
}

#[tauri::command]
fn get_locale_ip() -> String {
  let ip = local_ipaddress::get().unwrap();
  println!("ip, {}", ip);
  format!("{}", ip)
}

#[tauri::command]
fn send_file_client<R: Runtime>(window: tauri::Window<R>, file_path: &str) -> String {
  let (tx, rx) = oneshot::channel();

  let file_size = metadata(file_path).unwrap().len();

  let port = send_file(PORT, file_path, file_size, tx);

  let a = "success".to_string();
  a
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![get_locale_ip, start_broadcast_command, start_discovery_command, query_service, get_user_savepath, unregister_service, send_file_client])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
