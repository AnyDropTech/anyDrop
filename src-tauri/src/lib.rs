mod discovery;
use anyhow::{Result as AResult};
use serde::{Serialize, Deserialize};
use local_ipaddress;
use std::any::{self, Any};
use std::collections::{HashMap, HashSet, hash_map};
use std::net::Ipv4Addr;

use mdns_sd::{TxtProperties, TxtProperty};

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

#[derive(Debug)]
struct MyObject {
  data: TxtProperties,
  port: u16,
  ip_addrs: HashSet<Ipv4Addr>,
}

impl tauri::command::private::ResponseKind for MyObject {

}

#[tauri::command]
fn query_service(magic_string: &str) -> String {

  let res = query(magic_string);

  let info = res.unwrap();

  let pr = info.2.iter();

  let mut data = serde_json::Map::new();

  for ppr in  pr {
    let key = ppr.key();
    let val = ppr.val().unwrap().to_owned().pop().clone().unwrap();
    println!("ppr, {:?}, {:?}, {:?}", ppr, key, &val);
    data.insert(key.to_owned(), serde_json::Value::Number(val.into()));
  }

  let mut result = serde_json::Map::new();
  result.insert("data".to_string(), serde_json::Value::Object(data));
  result.insert("port".to_string(), serde_json::Value::Number(info.1.into()));
  result.insert("ip_addrs".to_string(), serde_json::Value::Array(info.0.iter().map(|i| serde_json::Value::String(i.to_string())).collect()));

  let json_value = serde_json::Value::Object(result);
  // format!("{:?}", serde_json::to_string(&json_value))
  json_value.to_string()
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
