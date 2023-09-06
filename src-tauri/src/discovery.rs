mod utils;

use std::collections::HashMap;
use std::net::Ipv4Addr;

use mdns_sd::{ServiceDaemon, ServiceInfo, ServiceEvent};
use names::Generator;

use anyhow::anyhow;
pub use anyhow::Result as AResult;
use tokio::sync::oneshot;

// use crate::utils::get_progressbar;

const SERVICE_TYPE: &str = "_rope._tcp.local.";
const PORT: u16 = 17682;

pub fn generate_magic_string() -> String {
    let mut generator = Generator::default();
    generator.next().unwrap()
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
pub struct Person {
  name: String,
  age: u32,
}

pub async fn query(magic_string: &str, tx: oneshot::Sender<Person>) -> AResult<(), anyhow::Error> {
  println!("Querying for service1: {}", magic_string);
  // Create a daemon
  let mdns = ServiceDaemon::new().expect("Failed to create daemon");

  let receiver = mdns.browse(&SERVICE_TYPE).expect("Failed to browse");

  let now = std::time::Instant::now();

  let expected_fullname = format!("{magic_string}.{SERVICE_TYPE}");

  println!("Looking for service: {}", expected_fullname);

  tokio::spawn(async move {
    if let Ok(ServiceEvent::ServiceResolved(info)) = receiver.recv() {
      // if info.get_fullname() == expected_fullname {
      //     println!("Matched service: {info:?}");
      //     println!(
      //         "At {:?}: Resolved a new service: {} host: {} port: {} IP: {:?} TXT properties: {:?}",
      //         now.elapsed(),
      //         info.get_fullname(),
      //         info.get_hostname(),
      //         info.get_port(),
      //         info.get_addresses(),
      //         info.get_properties(),
      //     );
      //     return;
      // }
      println!("Matched service: {info:?}");
      println!(
          "At {:?}: Resolved a new service: {} host: {} port: {} IP: {:?} TXT properties: {:?}",
          now.elapsed(),
          info.get_fullname(),
          info.get_hostname(),
          info.get_port(),
          info.get_addresses(),
          info.get_properties(),
      );
      let data = Person {
          name: "John".to_string(),
          age: 32,
        };
      let _ = tx.send(data).map_err(|_| anyhow!("Couldn't sent signal via channel"));
    }
  });
  Ok(())
}