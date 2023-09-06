mod utils;

use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;
use std::path::PathBuf;

use anyhow::anyhow;

use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo, TxtProperties};
use names::Generator;
use tokio::fs::File;

use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;

pub use anyhow::Result as AResult;
use tracing::debug;

// use crate::utils::get_progressbar;

const SERVICE_TYPE: &str = "_rope._tcp.local.";

pub fn generate_magic_string() -> String {
    let mut generator = Generator::default();
    generator.next().unwrap()
}

fn register_service(magic_string: &str, port: u16, data: HashMap<String, String>) -> AResult<()> {
  let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  let my_addrs: Vec<Ipv4Addr> = utils::my_ipv4_interfaces()
      .iter()
      .map(|i| i.ip)
      .collect();
  debug!("Collected addresses: {my_addrs:?}");

  let service_info = ServiceInfo::new(
    SERVICE_TYPE,
    magic_string,
    &format!("{magic_string}.local."),
    &my_addrs[..],
    port,
    Some(data),
  )?;

  mdns.register(service_info)?;

  debug!("Service registered: {magic_string}.{SERVICE_TYPE}");

  Ok(())
}
