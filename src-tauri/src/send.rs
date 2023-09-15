use std::collections::{HashMap, HashSet};
use std::net::Ipv4Addr;
use std::path::PathBuf;

use local_ipaddress;

use anyhow::anyhow;

use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo, TxtProperties};
use names::Generator;
use tokio::fs::File;

use tokio::io::AsyncRead;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::oneshot;

pub use anyhow::Result as AResult;
use tracing::debug;

use crate::discovery::SERVICE_TYPE;


// pub const SERVICE_TYPE: &str = "_rope_._tcp.local.";

fn generate_magic_string() -> String {
    let mut generator = Generator::default();
    generator.next().unwrap()
}

pub fn send_msg(magic_string: &str, port: u16, data: HashMap<String, String>) -> AResult<()> {
    let mdns = ServiceDaemon::new()?;
    println!("++++++++++++++++{magic_string}====={port}");
    let my_addrs: Vec<Ipv4Addr> = crate::utils::my_ipv4_interfaces()
        .iter()
        .map(|i| i.ip)
        .collect();

    println!("Collected addresses: {my_addrs:?}");

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

    println!("Service registered: {magic_string}.{SERVICE_TYPE}");

    Ok(())
}

pub fn recv_msg(magic_string: &str) -> AResult<(HashSet<Ipv4Addr>, u16, TxtProperties)> {
    let mdns = ServiceDaemon::new()?;

    let receiver = mdns.browse(SERVICE_TYPE)?;

    let expected_fullname = format!("{magic_string}.{SERVICE_TYPE}");

    let host_fullname = format!("{magic_string}_.local.");


    loop {
        if let ServiceEvent::ServiceResolved(info) = receiver.recv()? {
            println!("[][][][][], {:?}",info);
            println!("[][][][][] expected_fullname, {:?} = {:?}",expected_fullname, info.get_fullname());
            println!("[][][][][] host_fullname, {:?} = {:?}",expected_fullname, info.get_hostname());
            if info.get_fullname() == expected_fullname {
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

fn set_rogress(size: u8) {
  println!("{}", size);
}

pub async fn send_file(port: u16, file_path: &str, size: u64, tx: oneshot::Sender<()>) -> AResult<u16> {
    let listener =TcpListener::bind("0:0").await?;

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

    // let pb = get_progressbar(size);

    let medata = std::fs::metadata(path);

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

    tokio::io::copy(&mut stream, &mut f).await?;

    println!("Done");

    Ok(())
}
