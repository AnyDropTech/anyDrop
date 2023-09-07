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

pub fn register_service(magic_string: &str, data: HashMap<String, String>) -> AResult<()> {
  let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  let my_addrs: Vec<Ipv4Addr> = utils::my_ipv4_interfaces()
      .iter()
      .map(|i| i.ip)
      .collect();
  println!("Collected addresses: {my_addrs:?}");

  let instance_name = &format!("{magic_string}.local.");

  let service_info = ServiceInfo::new(
    SERVICE_TYPE,
    magic_string,
    instance_name,
    &my_addrs[..],
    PORT,
    Some(data),
  )?;

  println!("Service registered: {magic_string}.{SERVICE_TYPE}");

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