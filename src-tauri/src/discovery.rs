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

use crate::utils::get_progressbar;

const SERVICE_TYPE: &str = "_rope._tcp.local.";

pub fn generate_magic_string() -> String {
    let mut generator = Generator::default();
    generator.next().unwrap()
}

pub fn register_service() {
  let mdns = ServiceDaemon::new().expect("Could not create service daemon");
  let my_addrs: Vec<Ipv4Addr> = crate::utils::my_ipv4_interfaces()
        .iter()
        .map(|i| i.ip)
        .collect();

    debug!("Collected addresses: {my_addrs:?}");
}