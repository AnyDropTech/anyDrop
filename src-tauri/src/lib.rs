mod discovery;

use local_ipaddress;
use std::collections::HashMap;

use discovery::{register_service, query};

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
fn query_service(magic_string: &str) -> serde_json::Value {

  let res = query(magic_string);

  let info = res.unwrap();

  let pr = info.4.iter();

  let mut data = serde_json::Map::new();

  for ppr in  pr {
    let key = ppr.key();
    let val = ppr.val().unwrap().to_owned().pop().clone().unwrap();
    println!("ppr, {:?}, {:?}, {:?}", ppr, key, &val);
    data.insert(key.to_owned(), serde_json::Value::Number(val.into()));
  }

  let mut result = serde_json::Map::new();
  result.insert("data".to_string(), serde_json::Value::Object(data));
  result.insert("fullname".to_string(), serde_json::Value::String(info.1.to_string()));
  result.insert("host_name".to_string(), serde_json::Value::String(info.2.to_string()));
  result.insert("port".to_string(), serde_json::Value::Number(info.3.into()));
  result.insert("ip_addrs".to_string(), serde_json::Value::Array(info.0.iter().map(|i| serde_json::Value::String(i.to_string())).collect()));

  let json_value = serde_json::Value::Object(result);
  json_value
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
