// src-tauri/src/discovery.rs

use mdns::{Record, RecordKind, RecordType, TxtRecord};
use std::collections::HashSet;
use std::net::Ipv4Addr;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub fn start_discovery(
  discovered_devices: Arc<Mutex<HashSet<String>>>,
) -> Result<(), Box<dyn std::error::Error>> {
  // 创建一个Zeroconf浏览器
  let service_type_to_discover = "_mydevice._tcp.local.";
  let browser = mdns::MdnsBrowser::new(service_type_to_discover)?;

  // 监听设备发现事件
  let receiver = browser.browse();

  println!("Device discovery is running. Press Ctrl+C to exit.");

  // 创建一个线程来定期打印已发现的设备列表
  let discovered_devices_clone = discovered_devices.clone();
  thread::spawn(move || {
      loop {
          println!("Discovered devices:");
          for device in &*discovered_devices_clone.lock().unwrap() {
              println!("{}", device);
          }
          thread::sleep(Duration::from_secs(10));
      }
  });

  // 处理设备发现事件
  for response in receiver {
      match response? {
          mdns::Response::Query(query) => {
              if query.questions.len() == 1 && query.questions[0].qname == service_type_to_discover {
                  // 发现设备
                  for record in query.answers.iter().filter(|r| r.kind == RecordKind::PTR) {
                      if let Record::Ptr(ptr) = record {
                          let device_name = ptr.to_string();
                          println!("Found device: '{}'", device_name);

                          // 将已发现的设备添加到HashSet中
                          discovered_devices.lock().unwrap().insert(device_name);
                      }
                  }
              }
          }
          _ => {}
      }
  }

  Ok(())
}

pub fn start_broadcast(
  broadcast_enabled: Arc<Mutex<bool>>,
) -> Result<(), Box<dyn std::error::Error>> {
  // 启动线程来广播设备服务
  let broadcaster_handle = thread::spawn(move || {
      loop {
          // 检查广播开关状态
          let enabled = *broadcast_enabled.lock().unwrap();
          if enabled {
              // 广播设备服务的代码
              let device_name = "MyDevice";
              let device_service_type = "_mydevice._tcp.local.";
              let device_port = 8080;

              let txt_data = TxtRecord::new().insert("key1", "value1").insert("key2", "value2");

              let txt_record = Record::new(
                  device_name.to_string(),
                  RecordType::TXT,
                  RecordKind::TXT,
              )
              .append(&txt_data);

              let a_record = Record::new(
                  device_name.to_string(),
                  RecordType::A,
                  RecordKind::A,
              )
              .append("127.0.0.1"); // 设置设备的IP地址

              let srv_record = Record::new(
                  device_name.to_string(),
                  RecordType::SRV,
                  RecordKind::SRV,
              )
              .append(0) // 优先级
              .append(0) // 权重
              .append(device_port); // 端口号

              let mut records = Vec::new();
              records.push(txt_record);
              records.push(a_record);
              records.push(srv_record);

              let publisher = mdns::Publisher::new().expect("Failed to create publisher");
              if let Err(err) = publisher.publish(&records) {
                  eprintln!("Failed to publish service: {:?}", err);
              }

              println!("Device service broadcasting is enabled.");
          } else {
              println!("Device service broadcasting is disabled.");
          }

          thread::sleep(Duration::from_secs(10)); // 定期检查广播开关状态
      }
  });

  // 在这里存储 broadcaster_handle，以便稍后可以等待线程完成

  broadcaster_handle.join().unwrap();

  Ok(())
}
