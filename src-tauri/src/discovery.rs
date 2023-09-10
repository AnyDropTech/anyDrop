mod utils;

use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;
use std::time::Duration;
use serde_json::{ Value, json };

use mdns_sd::{ServiceDaemon, ServiceInfo, ServiceEvent, TxtProperties};

pub use anyhow::Result as AResult;
use tauri::Window;

// use crate::utils::get_progressbar;

const SERVICE_TYPE: &str = "_rope._tcp.local.";
const PORT: u16 = 17682;

// pub fn generate_magic_string() -> String {
//     let mut generator = Generator::default();
//     generator.next().unwrap()
// }

// pub enum Platfrom {
//   IOS,
//   ANDROID,
//   MAC,
//   WINDOWS,
//   LINUX,
// }

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClientDevice {
  nickname: String,
  device_name: String,
  password: String,
  receive: bool,
  auto_receive: bool,
  receive_dir: String,
  history: bool
}

impl ClientDevice {
  fn to_hashmap(&self) -> HashMap<String, String> {
      let mut map = HashMap::new();
      map.insert("nickname".to_string(), self.nickname.to_string().clone());
      map.insert("device_name".to_string(), self.device_name.to_string().clone());
      map.insert("password".to_string(), self.password.to_string().clone());
      map.insert("receive".to_string(), self.receive.to_string().clone());
      map.insert("auto_receive".to_string(), self.auto_receive.to_string().clone());
      map.insert("receive_dir".to_string(), self.receive_dir.to_string().clone());
      map.insert("history".to_string(), self.history.to_string().clone());
      map
  }
}

pub fn register_service(data: ClientDevice) -> AResult<()> {
  let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  let my_addrs: Vec<Ipv4Addr> = utils::my_ipv4_interfaces()
      .iter()
      .map(|i| i.ip)
      .collect();
  println!("Collected addresses: {my_addrs:?}");

  let password = &data.password.clone();

  let instance_name = &format!("{password}.local.");

  // let data_hash_map = data.to_hashmap();

  // Serialize the object to serde_json::Value
  let value: Value = serde_json::to_value(&data).unwrap();

  // Convert serde_json::Value to HashMap<String, String>
  let data_hash_map: HashMap<String, String> = serde_json::from_value(value)
      .and_then(|v| {
          if let Value::Object(m) = v {
              // Ok(m.iter().filter_map(|(k, v)| v.as_str().map(|vs| (k.clone(), vs.to_string()))).collect())
              let mut result_map = HashMap::new();
                for (k, v) in m {
                    match v {
                        Value::String(vs) => {
                            result_map.insert(k, vs);
                        }
                        Value::Bool(b) => {
                            result_map.insert(k, b.to_string());
                        }
                        _ => {}
                    }
                }
                Ok(result_map)
          } else {
              Err(<serde_json::Error as serde::de::Error>::custom("Expected an object"))
          }
      })
      .unwrap();

  // Print the resulting HashMap
  println!("{:?}", data_hash_map);


  let service_info = ServiceInfo::new(
    SERVICE_TYPE,
    password,
    instance_name,
    &my_addrs[..],
    PORT,
    Some(data_hash_map),
  )?;

  println!("Service registered: {password}.{SERVICE_TYPE}");

  let monitor = mdns.monitor().expect("Failed to monitor the daemon");
  let service_fullname = service_info.get_fullname().to_string();
  mdns.register(service_info)
      .expect("Failed to register mDNS service");

  println!("Registered service {}.{}.{}", &instance_name, &SERVICE_TYPE, service_fullname);


  // Monitor the daemon events.
  std::thread::spawn(move || {
    while let Ok(event) = monitor.recv() {
      println!("Daemon event: {:?}", &event);
    }
  });

  Ok(())
}

fn parse_info(res: (HashSet<Ipv4Addr>, String, String, u16, TxtProperties)) -> serde_json::Value {
  let info = res.clone();

  let pr = info.4.iter();
  println!("res, {:?}", info.4);

  let mut data = serde_json::Map::new();

  for ppr in  pr {
    // let key = ppr.val_str();
    let key = ppr.key();
    // let val = ppr.val().unwrap().to_owned().clone().unwrap();
    // let vv = &val;
    println!("ppr, {:?}, {:?}", ppr, key);
    // println!("ppr, {:?}, {:?}, {:?}, {:?}, {:?}", ppr, key, &val, vv, ppr.val());
    data.insert(key.to_owned(), serde_json::Value::String(ppr.val_str().to_string()));
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

pub fn query(window: Window, password: &str) {
  // Create a daemon
  let mdns = ServiceDaemon::new().expect("Failed to create daemon");

  let receiver = mdns.browse(&SERVICE_TYPE).expect("Failed to browse");

  // let now = std::time::Instant::now();
  let fullname = format!("{}.{}", password, SERVICE_TYPE);
  let mut result_vec = Vec::new(); // 创建一个空的 Vec 来存储结果
  std::thread::spawn(move || {
    loop {
      if let ServiceEvent::ServiceResolved(info) = receiver.recv().unwrap() {
        let service_info = info.clone();
        println!("test ================== {:?} +++++ {:?}", service_info, service_info.get_type());
        if service_info.get_fullname() == fullname {

        };
        if service_info.get_type() == SERVICE_TYPE && service_info.get_fullname() != fullname {
          println!("test ================== {:?}", service_info);
          let res = parse_info((
            service_info.clone().get_addresses().clone(),
            service_info.clone().get_fullname().clone().to_string(),
            service_info.clone().get_hostname().clone().to_string(),
            service_info.clone().get_port().clone(),
            service_info.clone().get_properties().clone(),
          ));
          // 将结果添加到HashMap中
          let exists = result_vec.iter().any(|item| *item == res);
          println!("exists, {:?}", exists);
          if !exists {
            result_vec.push(res.clone());
          }
        }
      }
      println!("info {:?}", result_vec.clone());
      let _ = window.emit("service_discovery", result_vec.clone());
      std::thread::sleep(Duration::from_secs(10));
    };
  });

  //   if let Ok(ServiceEvent::ServiceResolved(info)) = receiver.recv_timeout(Duration::from_secs(10)) {
  //     let service_info = info.clone();
  //     println!("test ================== {:?} +++++ {:?}", service_info, service_info.get_type());

  //     if service_info.get_type() == SERVICE_TYPE {
  //       println!("test ================== {:?}", service_info);
  //       let res = parse_info((
  //         service_info.clone().get_addresses().clone(),
  //         service_info.clone().get_fullname().clone().to_string(),
  //         service_info.clone().get_hostname().clone().to_string(),
  //         service_info.clone().get_port().clone(),
  //         service_info.clone().get_properties().clone(),
  //       ));
  //       // 将结果添加到HashMap中
  //       result_vec.push(res.clone());
  //       // result_set.insert(res.clone());
  //       // window.emit("service_discovery", res);
  //     }
  //     // std::thread::sleep(Duration::from_secs(10));
  //   };
  //   let _ = window.emit("service_discovery", result_vec.clone());
  //   // 添加延迟等待10秒再进行下一次扫描
  // });

  // std::thread::spawn(move || {
  //     let mut result_set = HashSet::new<serde_json::Values>(); // 创建一个HashMap来存储结果
  //     while if let Ok(ServiceEvent::ServiceResolved(info)) = receiver.recv() {
  //         let _info = info.clone();
  //         println!("Found service: {:?}, {:?}", _info, info.get_type());
  //         if info.get_type() == SERVICE_TYPE {
  //             let _info = (
  //               _info.clone().get_addresses().clone(),
  //               _info.clone().get_fullname().clone().to_string(),
  //               _info.clone().get_hostname().clone().to_string(),
  //               _info.clone().get_port().clone(),
  //               _info.clone().get_properties().clone(),
  //             );
  //             let res = parse_info(_info.clone());
  //             // 将结果添加到HashMap中
  //             result_set.insert(res.clone())
  //             // window.emit("service_discovery", res);
  //         }
  //     }
  //   }
  //      // 添加定时延迟，例如每隔5秒执行一次扫描
  //      std::thread::sleep(Duration::from_secs(5));
  //   // 扫描结束后，通过事件将整个HashMap返回
  //   window.emit("service_discovery", result_set);
  // });
}