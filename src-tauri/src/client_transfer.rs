//! Service daemon for client transfer.

use std::{path::PathBuf, net::SocketAddr};

pub use anyhow::Result as AResult;
use rfd::FileDialog;
use tokio::net::{TcpListener, TcpStream};

pub const CLIENT_PORT: u32 = 16008;

// pub static mut
pub fn init_tcplistener() {
  let addr = format!("0.0.0.0:{}", CLIENT_PORT);

  tokio::spawn(async move {
    let listener = TcpListener::bind(addr).await.unwrap();
    println!("监听地址: {}", listener.local_addr().unwrap());
    println!("监听端口: {}", CLIENT_PORT);

    match listener.accept().await {
      Ok((client_socket, addr)) => {
        println!("接收到来自{:?}的连接", addr);
        // 读取确认消息
        let mut confirmation_buf = [0; 4096];
        let _ = client_socket.readable().await;

        match client_socket.try_read(&mut confirmation_buf) {
          Ok(_) => {
            let confirmation_msg = String::from_utf8_lossy(&confirmation_buf);
            println!("接收到确认消息: {}", confirmation_msg);
          },
          Err(e) => {
            println!("读取确认消息失败: {}", e);
            return;
          }
        }
      }
      Err(e) => {
        println!("接收连接失败: {}", e);
        return;
      }
    }
  });
}

#[tauri::command]
pub async fn send_file_confirmation(target_ip: &str) -> Result<(), String> {
    // 连接到目标设备
    let target_addr: SocketAddr = format!("{target_ip}:{CLIENT_PORT}").parse().unwrap();
    let target_socket = TcpStream::connect(target_addr).await.unwrap();


    // 发送确认消息
    let confirmation_msg = b"READY_TO_RECEIVE";
    let _ = target_socket.writable().await;

    match target_socket.try_write(confirmation_msg) {
      Ok(_) => {},
      Err(e) => {
        println!("发送确认消息失败: {}", e);
        return Err(e.to_string());
      }
    }
    // target_socket.write_all(confirmation_msg).await.map_err(|e| e.to_string())?;
    Ok(())
}

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