mod discovery;
use std::collections::HashMap;
use local_ipaddress;

use discovery::{register_service, query, Person};

use tokio::sync::oneshot;

#[tauri::command]
fn start_discovery_command() {
  // register_service();
}

#[tauri::command]
fn start_broadcast_command(magic_string: &str, data: HashMap<String, String>)  {
  let _res = register_service(magic_string, data);

  format!("{}", "success");
}

#[tauri::command]
fn query_service(magic_string: &str) {
  let (tx, rx) = oneshot::channel();

  let res = query(magic_string, tx);

  // rx.await.expect_err("failed to receive response")

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
    .invoke_handler(tauri::generate_handler![count, get_locale_ip, start_broadcast_command, start_discovery_command, query_service])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
