//! Service daemon for client transfer.

use std::{path::PathBuf, net::{SocketAddr, Shutdown}};

pub use anyhow::Result as AResult;
use rfd::FileDialog;
use tokio::{net::{TcpListener, TcpStream}, io::AsyncWriteExt};

pub const CLIENT_PORT: u32 = 16008;

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
  let mut confirmation_buf = [0; 4096];
  let _ = client_socket.readable().await;

  if let is_read = client_socket.readable().await.is_ok() {
    match client_socket.try_read(&mut confirmation_buf) {
      Ok(_) => {
        let confirmation_msg = String::from_utf8_lossy(&confirmation_buf);
        println!("接收到确认消息: {}", confirmation_msg);
        // client_socket.shutdown().await.expect("关闭连接失败");
      },
      Err(e) => {
        println!("读取确认消息失败: {}", e);
        return;
      }
    }
  }
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct FileInfoItem {
  name: String,
  size: u64,
  path: String
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct SendFileInfo {
  ip: String,
  port: u32,
  files: Vec<FileInfoItem>,
  id: String
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
      port: 16008,
      files: vec![
        FileInfoItem {
          name: "test.txt".to_string(),
          size: 1024,
          path: "C:\\Users\\Administrator\\Desktop\\test.txt".to_string()
        }
      ]
    };
    let json_info = serde_json::to_string(&file_info).unwrap();
    let confirmation_msg = json_info.as_bytes();
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