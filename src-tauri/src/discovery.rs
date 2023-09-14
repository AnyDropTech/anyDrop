mod utils;

use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;
use std::time::Duration;
use serde_json::Value;

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
  // fn to_hashmap(&self) -> HashMap<String, String> {
  //     let mut map = HashMap::new();
  //     map.insert("nickname".to_string(), self.nickname.to_string().clone());
  //     map.insert("device_name".to_string(), self.device_name.to_string().clone());
  //     map.insert("password".to_string(), self.password.to_string().clone());
  //     map.insert("receive".to_string(), self.receive.to_string().clone());
  //     map.insert("auto_receive".to_string(), self.auto_receive.to_string().clone());
  //     map.insert("receive_dir".to_string(), self.receive_dir.to_string().clone());
  //     map.insert("history".to_string(), self.history.to_string().clone());
  //     map
  // }
}
static mut MDNS: Option<ServiceDaemon> = None;
pub fn register_service(data: ClientDevice) -> AResult<()> {
  // let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  // 获取或初始化 mdns 变量
  let mdns = unsafe {
    if MDNS.is_none() {
        MDNS = Some(ServiceDaemon::new().expect("Could not create service daemon"));
    }
    MDNS.as_ref().unwrap()
  };

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

  // std::thread::spawn(move || {
  //   let wait_in_secs = 20;
  //   println!("Sleeping {} seconds before unregister", wait_in_secs);
  //   std::thread::sleep(Duration::from_secs(wait_in_secs));

  //   let receiver = mdns.unregister(&service_fullname).unwrap();
  //   while let Ok(event) = receiver.recv() {
  //       println!("unregister result: {:?}", &event);
  //   }
  // });

  // Monitor the daemon events.
  std::thread::spawn(move || {
    while let Ok(event) = monitor.recv() {
      println!("Daemon event: {:?}", &event);
    }
  });

  Ok(())
}
pub fn unregister(password: &str) {
  // let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  let mdns = unsafe {
    MDNS.as_ref().unwrap()
  };
  let fullname = format!("{}.{}", password, SERVICE_TYPE);
  println!("Unregistering service {}", &fullname);
  let receiver = mdns.unregister(&fullname).unwrap();
  while let Ok(event) = receiver.recv() {
    println!("unregister result: {:?}", &event);
  }
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
  result.insert("offline".to_string(), serde_json::Value::Bool(false));

  let json_value = serde_json::Value::Object(result);

  json_value
}

pub fn query_handler (window: Window, password: &str) {
  // Create a daemon
  let mdns = ServiceDaemon::new().expect("Failed to create daemon");

  let receiver = mdns.browse(&SERVICE_TYPE).unwrap();

  let fullname = format!("{}.{}", password, SERVICE_TYPE);

  let mut result_vec = Vec::new(); // 创建一个空的 Vec 来存储结果

  std::thread::spawn(move || {
    while let Ok(event) = receiver.recv() {
      match event {
        ServiceEvent::SearchStarted(ty_domain) => {
            println!("Search started for {}", &ty_domain);
        }
        ServiceEvent::ServiceFound(_ty_domain, fullname) => {
            println!("Found a new service: {}", &fullname);
        }
        ServiceEvent::ServiceResolved(info) => {
          let service_info = info.clone();
          if service_info.get_type() == SERVICE_TYPE  {
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
            // if !exists {
            //   result_vec.push(res.clone());
            // }
            result_vec.push(res.clone());

          }
        }
        ServiceEvent::ServiceRemoved(service_type, service_fullname) => {
          println!("========================removed: {:?}-{:?}", service_type, service_fullname);
        }
        ServiceEvent::SearchStopped(ty) => {
          println!("Search stopped for {}", &ty);
        }
        ServiceEvent::VerifyClient(fullname, service_type, offline) => {
          println!("========================verify: {:?}-{:?}-{:?}", fullname, service_type, offline);
          let mut i = 0;
          while i < result_vec.len() {
            let mut current = result_vec[i].clone();
            let current_fullname = current.get("fullname").unwrap().as_str().unwrap().to_string();
            if current_fullname == fullname {
              current["offline".to_string()] = serde_json::Value::Bool(offline);
              result_vec[i] = current;
              break;
            }
            i+=1;
          };
          let _ = window.emit("service_discovery", result_vec.clone());
          continue;
        }
      }

      println!("info {:?}", result_vec.clone());
      let _ = window.emit("service_discovery", result_vec.clone());
      // mdns.verify(fullname.clone(), SERVICE_TYPE.to_string());
      let mut i = 0;
      println!("result_vec.len(), {:?}", result_vec.len());
      while i < result_vec.len() {
        let current = result_vec[i].clone();
        let fullname = current.get("fullname").unwrap().as_str().unwrap().to_string();
        println!("fullname, {:?}", fullname);
        let _ = mdns.verify(fullname.clone(), SERVICE_TYPE.to_string());
        i+=1;
      }
      std::thread::sleep(Duration::from_secs(1));
    }
  });
}