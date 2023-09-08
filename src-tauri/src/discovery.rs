mod utils;

use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;

use mdns_sd::{ServiceDaemon, ServiceInfo, ServiceEvent, TxtProperties};
use names::Generator;

pub use anyhow::Result as AResult;
use tokio::sync::oneshot;

// use crate::utils::get_progressbar;

const SERVICE_TYPE: &str = "_rope._tcp.local.";
const PORT: u16 = 17682;

pub fn generate_magic_string() -> String {
    let mut generator = Generator::default();
    generator.next().unwrap()
}

pub enum Platfrom {
  IOS,
  ANDROID,
  MAC,
  WINDOWS,
  LINUX,
}

pub struct Person {
  platform: Platfrom,
  nickname: String,
  device_name: String,
  color: String
}

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
      map.insert("nickname".to_string(), self.nickname.clone());
      map.insert("device_name".to_string(), self.device_name.clone());
      map.insert("password".to_string(), self.password.clone());
      map.insert("receive".to_string(), self.receive.to_string());
      map.insert("auto_receive".to_string(), self.auto_receive.to_string());
      map.insert("receive_dir".to_string(), self.receive_dir.clone());
      map.insert("history".to_string(), self.history.to_string());
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

  let data_hash_map = data.to_hashmap();

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


pub fn query(magic_string: &str) -> AResult<(HashSet<Ipv4Addr>, String, String, u16, TxtProperties)> {
  println!("Querying for service1: {}", magic_string);
  // Create a daemon
  let mdns = ServiceDaemon::new().expect("Failed to create daemon");

  let receiver = mdns.browse(&SERVICE_TYPE).expect("Failed to browse");

  // let now = std::time::Instant::now();

  let expected_fullname = format!("{magic_string}.{SERVICE_TYPE}");

  println!("Looking for service: {}", expected_fullname);

  loop {
    if let ServiceEvent::ServiceResolved(info) = receiver.recv()? {
        let _info = info.clone();
        if info.get_type() == SERVICE_TYPE {
            return Ok((
                _info.clone().get_addresses().clone(),
                _info.clone().get_fullname().clone().to_string(),
                _info.clone().get_hostname().clone().to_string(),
                _info.clone().get_port().clone(),
                _info.clone().get_properties().clone(),
            ));
        }
    }
}
}