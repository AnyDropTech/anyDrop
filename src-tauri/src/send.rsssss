use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;
use std::path::PathBuf;

use anyhow::anyhow;

use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo, TxtProperties};
use tokio::fs::File;

use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;

pub use anyhow::Result as AResult;

use crate::discovery::SERVICE_TYPE;

pub static mut MDNS: Option<ServiceDaemon> = None;

pub fn send_msg(magic_string: &str, port: u16, data: HashMap<String, String>) -> AResult<()> {
    // let mdns = ServiceDaemon::new()?;
    let mdns = unsafe {
      if MDNS.is_none() {
          MDNS = Some(ServiceDaemon::new().expect("Could not create service daemon"));
      }
      MDNS.as_ref().unwrap()
    };
    let my_addrs: Vec<Ipv4Addr> = crate::utils::my_ipv4_interfaces()
        .iter()
        .map(|i| i.ip)
        .collect();

    let host_fullname = format!("{magic_string}.local.");

    let service_info = ServiceInfo::new(
        SERVICE_TYPE,
        magic_string,
        &host_fullname,
        &my_addrs[..],
        port,
        Some(data),
    )?;

    mdns.register(service_info).expect("register failed");

    Ok(())
}

pub fn unregister_file_service(password: &str) {
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


pub fn recv_msg(magic_string: &str) -> AResult<(HashSet<Ipv4Addr>, u16, TxtProperties)> {
    let mdns = ServiceDaemon::new()?;

    let receiver = mdns.browse(SERVICE_TYPE)?;

    let expected_fullname = format!("{magic_string}.{SERVICE_TYPE}");

    loop {
        if let ServiceEvent::ServiceResolved(info) = receiver.recv()? {
            let name = info.get_properties().get("name");
            println!("======================{:?}", name);
            if info.get_fullname() == expected_fullname && !name.is_none() {
                println!("Matched service: {info:?}");
                return Ok((
                    info.get_addresses().clone(),
                    info.get_port(),
                    info.get_properties().clone(),
                ));
            }
        }
    }
}

pub async fn send_file(port: u16, file_path: &str, size: u64, tx: oneshot::Sender<()>) -> AResult<u16> {
    let listener = TcpListener::bind("0.0.0.0:0").await?;

    let addr = listener.local_addr()?;

    println!("Listening at {addr:?}");

    let file_path_owned = file_path.to_owned();

    tokio::spawn(async move {
        let (mut socket, _b) = listener.accept().await?;

        println!("Peer is connected. Sending filewww: {file_path_owned}");

        let mut f = File::open(file_path_owned).await?;

        tokio::io::copy(&mut f, &mut socket).await?;

        println!("Done. Sending signal via channel");

        tx.send(())
            .map_err(|_| anyhow!("Couldn't sent signal via channel"))
    });

    Ok(addr.port())
}

pub async fn recv_file(ip: &Ipv4Addr, port: u16, folder_path: &str, path: &PathBuf, size: u64) -> AResult<()> {
    let addr = format!("{ip}:{port}");
    println!("rece  addr {addr}");
    let mut stream = TcpStream::connect(addr).await?;

    println!("Peer is connected. Receiving file222: {path:?} {folder_path:?}");

    // 使用 std::fs::metadata 检测文件夹是否存在
    match std::fs::metadata(&folder_path) {
      Ok(metadata) => {
          if metadata.is_dir() {
              println!("文件夹已经存在");
          } else {
              println!("路径存在，但不是文件夹");
          }
      }
      Err(_) => {
          // 文件夹不存在，尝试创建它
          match std::fs::create_dir_all(&folder_path) {
              Ok(_) => {
                  println!("文件夹已成功创建");
              }
              Err(err) => {
                  eprintln!("创建文件夹时出错: {:?}", err);
              }
          }
      }
  }

    let mut f = File::create(path).await.unwrap();

    let size = tokio::io::copy(&mut stream, &mut f).await?;
    println!("Done");

    Ok(())
}
