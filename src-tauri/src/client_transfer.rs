//! Service daemon for client transfer.

use std::{path::PathBuf, net::SocketAddr};

pub use anyhow::Result as AResult;
use rfd::FileDialog;
use serde_json::Value;
use tokio::{net::{TcpListener, TcpStream}, io::AsyncWriteExt};

use crate::global::get_global_window;

pub const CLIENT_PORT: u32 = 16008;


#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct FileInfoItem {
  name: String,
  size: u64,
  path: String
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SendFileInfo {
  id: String,
  ip: String,
  fullname: String,
  device_name: String,
  port: u32,
  files: Vec<FileInfoItem>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SendMessage <S>{
  msg_type: String,
  playload: S
}



/**
 * 初始化tcp监听器
 */
pub fn init_tcplistener() {
  let addr = format!("0.0.0.0:{}", CLIENT_PORT);

  tokio::spawn(async move {
    let listener = TcpListener::bind(&addr).await.expect("监听地址绑定失败");
    println!("监听地址: {}", listener.local_addr().unwrap());
    println!("监听端口: {}", CLIENT_PORT);

    while let Ok((client_socket, _)) = listener.accept().await {
      tokio::spawn(async move {
        // 单独处理每个客户端连接
        handle_client(client_socket).await;
      });
    };
  });
}

/**
 * 处理客户端连接
 */
async fn handle_client(client_socket: TcpStream) {
  // 读取确认消息
  let mut confirmation_buf = [0; 1024];
  let _ = client_socket.readable().await;

  if let _is_read = client_socket.readable().await.is_ok() {
    match client_socket.try_read(&mut confirmation_buf) {
      Ok(n) => {
        let confirmation_msg = String::from_utf8_lossy(&confirmation_buf[..n]);
        transfer_recever_message(confirmation_msg.to_string());
        // println!("接收到确认消息: {}", confirmation_msg);
        // client_socket.shutdown().await.expect("关闭连接失败");
      },
      Err(e) => {
        println!("读取确认消息失败: {}", e);
        return;
      }
    }
  }
}
/**
 * 处理接收到的确认消息
 */
fn transfer_recever_message(message: String) {
  println!("接收到确认消息222: {}", message);
  let message = serde_json::from_str::<SendMessage<Value>>(&message);
  let window = get_global_window();

  match message {
    Ok(parse_message) => {
      match parse_message.msg_type.as_str() {
        "confirm" => {
          let send_file_info = serde_json::from_value::<SendFileInfo>(parse_message.playload.clone())
          .expect("解析 SendFileInfo 失败");
          window.emit::<SendFileInfo>("anyDrop://send_file_confirmation", send_file_info.clone()).expect("发送确认消息失败");
          println!("接收到确认消息: {:?}", send_file_info.clone());
        },
        "reject" => {
          let reject_file_info = serde_json::from_value::<RejectFileMessage>(parse_message.playload.clone()).expect("解析 RejectFileMessage 失败");
          window.emit::<RejectFileMessage>("anyDrop://reject_file_confirmation", reject_file_info.clone()).expect("发送拒绝消息失败");
          println!("接收到拒绝消息: {:?}", reject_file_info.clone());
        },
        _ => {}
      }
    },
    Err(e) => {
      println!("解析确认消息失败: {:?}", e);
    }
  }
}

/**
 * 发送文件确认消息
 */
#[tauri::command]
pub async fn send_file_confirmation(target_ip: &str) -> Result<(), String> {
    // 连接到目标设备
    let target_addr: SocketAddr = format!("{target_ip}:{CLIENT_PORT}").parse().expect("目标设备地址解析失败");
    // let mut target_socket = TcpStream::connect(target_addr).await.expect("连接到目标设备失败");
    let mut target_socket = match TcpStream::connect(target_addr).await {
      Ok(socket) => socket,
      Err(e) => {
          println!("连接到目标设备失败: {}", e);
          return Err(e.to_string());
      }
    };

    // 发送确认消息
    let file_info = SendFileInfo {
      id: "aaa".to_string(),
      ip: "127.0.0.1".to_string(),
      fullname: "cavin-ssss".to_string(),
      device_name: "cavin-aaaa".to_string(),
      port: 16008,
      files: vec![
        FileInfoItem {
          name: "test.txt".to_string(),
          size: 1024,
          path: "C:\\Users\\Administrator\\Desktop\\test.txt".to_string()
        }
      ]
    };
    let send_message = SendMessage {
      msg_type: "confirm".to_string(),
      playload: file_info
    };
    // let send_message_value = serde_json::to_value(&send_message).unwrap();
    let send_mesage_string = serde_json::to_string(&send_message).unwrap();
    let confirmation_msg = send_mesage_string.as_bytes();
    let _ = target_socket.writable().await;

    if target_socket.writable().await.is_ok() {
      match target_socket.try_write(confirmation_msg) {
        Ok(_) => {
          println!("发送确认消息成功");
          target_socket.shutdown().await.expect("关闭连接失败");
        },
        Err(e) => {
          println!("发送确认消息失败: {}", e);
          return Err(e.to_string());
        }
      }
    }
    drop(target_socket);
    // target_socket.write_all(confirmation_msg).await.map_err(|e| e.to_string())?;
    Ok(())
}

/**
 * 拒绝接收文件消息
 */
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct RejectFileMessage {
  source_ip: String,
  source_fullname: String,
  target_fullname: String
}

/**
 * 拒绝接收文件
 */
#[tauri::command]
pub async fn reject_file_confirmation(source_ip: &str, source_fullname: &str, target_fullname: &str) -> Result<(), String> {
  let reject_message = RejectFileMessage {
    source_ip: source_ip.to_string(),
    source_fullname: source_fullname.to_string(),
    target_fullname: target_fullname.to_string()
  };
  // window.emit("anyDrop://reject_file_confirmation", reject_message).expect("发送拒绝消息失败");
  let source_addr: SocketAddr = format!("{source_ip}:{CLIENT_PORT}").parse().expect("目标设备地址解析失败");
  let mut source_socket = match TcpStream::connect(source_addr).await {
    Ok(socket) => socket,
    Err(e) => {
        println!("连接到目标设备失败: {}", e);
        return Err(e.to_string());
    }
  };

  // 发送拒绝消息
  let send_message = SendMessage {
    msg_type: "reject".to_string(),
    playload: reject_message
  };

  let send_mesage_string = serde_json::to_string(&send_message).unwrap();

  let reject_confirmation_msg = send_mesage_string.as_bytes();

  if source_socket.writable().await.is_ok() {
    match source_socket.try_write(reject_confirmation_msg) {
      Ok(_) => {
        println!("发送拒绝消息成功");
        source_socket.shutdown().await.expect("关闭连接失败");
      },
      Err(e) => {
        println!("发送拒绝消息失败: {}", e);
        return Err(e.to_string());
      }
    }
  }
  drop(source_socket);
  Ok(())
}

fn send_file_service(client_socket: TcpStream, files: &Vec<FileInfoItem>) {}

/**
 * 选择发送文件
 */
#[tauri::command]
pub fn select_send_file() -> Vec<PathBuf> {
  let files = FileDialog::new().pick_files();
  let file = files.unwrap_or_default();
  file.to_vec()
}

/**
 * 选择发送文件夹
 */
#[tauri::command]
pub fn select_send_dir() -> String {
  let folders = FileDialog::new().pick_folder();
  let folder = folders.unwrap_or_default();
  String::from(folder.to_str().unwrap_or_default())
}