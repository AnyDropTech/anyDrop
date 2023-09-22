//! Service daemon for mDNS Service Discovery.
use std::time::Duration;
use std::{net::Ipv4Addr, collections::HashSet};
use std::collections::HashMap;

use mdns_sd::{ServiceInfo, ServiceDaemon, TxtProperties, ServiceEvent};
use serde_json::Value;

use crate::global::{get_global_client_config, get_global_window};
use crate::{error::Result, client_config::{SERVICE_TYPE, PORT}};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClientDevice {
  nickname: String,
  device_name: String,
  password: String
}
#[derive(Clone)]
pub struct ClientConnector {
  sender_mdns: Option<ServiceDaemon>,
}

impl ClientConnector {
  pub fn new() -> Result<Self> {
    let sender_mdns = Some(ServiceDaemon::new().expect("Could not create service daemon"));
    Ok(Self {
      sender_mdns,
    })
  }

  pub fn get_my_local_ipv4(&self) -> Result<Vec<Ipv4Addr>> {
    Ok(crate::utils::my_ipv4_interfaces()
    .iter()
    .map(|i| i.ip)
    .collect())
  }

  pub fn data_to_hash(&self, value: Value) -> HashMap<String, String> {
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

    data_hash_map
  }

  pub fn register(&self, properties: ClientDevice) {
    let my_addrs = self.get_my_local_ipv4().unwrap();
    let password = &properties.password.clone();
    let instance_name = &format!("{password}.local.");
    let value: Value = serde_json::to_value(&properties).unwrap();
    let properties_hash = self.data_to_hash(value);

    let service_info = ServiceInfo::new(
      SERVICE_TYPE,
      password,
      instance_name,
      &my_addrs[..],
      PORT,
      Some(properties_hash),
    ).unwrap();

    let mdns = self.sender_mdns.as_ref().unwrap();
    let monitor = mdns.monitor().expect("Failed to monitor the daemon");
    match mdns.register(service_info.clone()) {
      Ok(_) => {
        println!("Service registered：{:?}", service_info.get_fullname());
      },
      Err(e) => {
        println!("Service register failed: {:?}", e);
      }
    }

    std::thread::spawn(move || {
      while let Ok(event) = monitor.recv() {
        println!("Daemon event: {:?}", &event);
      }
    });
  }

  pub fn unregister(&self, password: &str) {
    let fullname = format!("{}.{}", password, SERVICE_TYPE);
    let mdns = self.sender_mdns.as_ref().unwrap();
    let receiver = mdns.unregister(&fullname).unwrap();
    while let Ok(event) = receiver.recv() {
      println!("Event: {:?}", event);
    }
  }

  pub fn discovery(&self) {
    let mdns = self.sender_mdns.as_ref().unwrap();

    let receiver = mdns.browse(&SERVICE_TYPE).unwrap();

    discovery_events(receiver, mdns.clone())
  }
}


fn parse_info(res: (HashSet<Ipv4Addr>, String, String, u16, TxtProperties)) -> serde_json::Value {
  let info = res.clone();

  let pr = info.4.iter();

  let mut data = serde_json::Map::new();

  for ppr in  pr {
    let key = ppr.key();
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

pub fn discovery_events(receiver: mdns_sd::Receiver<mdns_sd::ServiceEvent>, mdns: ServiceDaemon) {
  let mut result_vec = Vec::new(); // 创建一个空的 Vec 来存储结果
  let mut count = 1;
  std::thread::spawn(move || {
    while let Ok(event) = receiver.recv() {
      match event {
        ServiceEvent::SearchStarted(ty_domain) => {
          println!("search_count: 【{:?}】", count);
          println!("Search started for {}", &ty_domain);
        }
        ServiceEvent::ServiceFound(_ty_domain, fullname) => {
            println!("Found a new service: {}", &fullname);
        }
        ServiceEvent::ServiceResolved(info) => {
          let service_info = info.clone();
          // println!("test ================== {:?}", service_info);
          if service_info.get_type() == SERVICE_TYPE  {
            // println!("test ================== {:?}", service_info);
            let res = parse_info((
              service_info.clone().get_addresses().clone(),
              service_info.clone().get_fullname().clone().to_string(),
              service_info.clone().get_hostname().clone().to_string(),
              service_info.clone().get_port().clone(),
              service_info.clone().get_properties().clone(),
            ));
            // 将结果添加到HashMap中
            // let exists = result_vec.iter().any(|item| *item == res);
            let exists = result_vec.clone().iter().any(|item: &Value| item.get("fullname").unwrap().as_str().unwrap() == res.get("fullname").unwrap().as_str().unwrap()).clone();
            // println!("==++++++++exists: {:?}", exists);
            if !exists {
              result_vec.push(res.clone());
            }
          }
        }
        ServiceEvent::ServiceRemoved(service_type, service_fullname) => {
          // println!("========================removed: {:?}-{:?}", service_type, service_fullname);
          let mut i = 0;
          while i < result_vec.len() {
            let current = result_vec[i].clone();
            let current_fullname = current.get("fullname").unwrap().as_str().unwrap().to_string();
            let current_name = current.get("data").unwrap().get("name");
            if current_fullname == service_fullname && service_type == SERVICE_TYPE && !current_name.is_none() {
              result_vec.remove(i);
              break;
            }
            i+=1;
          };
        }
        ServiceEvent::SearchStopped(ty) => {
          println!("Search stopped for {}", &ty);
        }
        ServiceEvent::VerifyClient(fullname, _service_type, offline) => {
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
          // let _ = window.emit("service_discovery", result_vec.clone());
          let _ = get_global_window().emit("AnyDrop://client_connector_discovery", result_vec.clone());
          continue;
        }
      }

      // println!("info {:?}", result_vec.clone());
      let _ = get_global_window().emit("AnyDrop://client_connector_discovery", result_vec.clone());
      let mut i = 0;
      while i < result_vec.len() {
        let current = result_vec[i].clone();
        let fullname = current.get("fullname").unwrap().as_str().unwrap().to_string();
        // println!("fullname, {:?}", fullname);
        let _ = mdns.verify(fullname.clone(), SERVICE_TYPE.to_string());
        i+=1;
      }
      count += 1;
      // std::thread::sleep(Duration::from_secs(1));
    }
  });
}

pub fn init_client_connector() {
  let client_connector = ClientConnector::new().unwrap();
  let client_config = get_global_client_config();
  let client_device = ClientDevice {
    nickname: client_config.nickname.clone(),
    device_name: client_config.device_name.clone(),
    password: client_config.password.clone()
  };
  client_connector.register(client_device);
  client_connector.discovery();
}