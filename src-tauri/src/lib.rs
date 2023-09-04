use local_ipaddress;

mod mdns;

use mdns::{start_discovery, start_broadcast};

#[tauri::command]
fn start_discovery_command() {
    start_discovery();
}

#[tauri::command]
fn start_broadcast_command() {
    start_broadcast();
}


#[tauri::command]
fn get_locale_ip() -> String {
  let ip = local_ipaddress::get().unwrap();
  println!("ip, {}", ip);
  format!("{}", ip)
}

#[tauri::command]
fn count(count: i32) -> String {
  format!("React Counting to {}...", count)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![count, get_locale_ip, zeroconf::zeroconf_rs_init])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
