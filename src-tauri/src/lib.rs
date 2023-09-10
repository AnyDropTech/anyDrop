mod discovery;

use local_ipaddress;
use tauri::Window;

use rfd::FileDialog;

use discovery::{register_service, query, ClientDevice};

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
fn query_service(window: Window, password: &str) -> String {
  query(window, password);
  let a = "success".to_string();
  a
}

#[tauri::command]
fn get_locale_ip() -> String {
  let ip = local_ipaddress::get().unwrap();
  println!("ip, {}", ip);
  format!("{}", ip)
}

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .invoke_handler(tauri::generate_handler![get_locale_ip, start_broadcast_command, start_discovery_command, query_service, get_user_savepath])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
