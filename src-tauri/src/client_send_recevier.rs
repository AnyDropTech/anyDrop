//! Service daemon for client transfer.
use std::{path::PathBuf, net::SocketAddr, ptr::copy};
use rfd::FileDialog;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use tokio::{net::{TcpListener, TcpStream}, io::{AsyncWriteExt, BufWriter, AsyncReadExt, BufReader}, sync::mpsc, fs::File, time::{sleep, Duration}};

use crate::client_global::get_global_window;

pub const CLIENT_PORT: u32 = 16008;
pub const CLIENT_FILE_PORT: u32 = 17008;

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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct FileMessage {
  file_name: String,
  file_data: Vec<u8>
}


#[derive(Debug, Clone, Serialize, Deserialize)]
struct Progress {
    total: u64,
    transferred: u64,
}

impl Progress {
  fn new(total: u64) -> Self {
    Self {
      total,
      transferred: 0,
    }
  }

  fn update(&mut self, transferred: u64) {
    self.transferred = transferred;
  }
}

/**
 * 初始化tcp监听器
 */
pub fn init_tcplistener() {
  let addr = format!("0.0.0.0:{}", CLIENT_PORT);
  let file_addr = format!("0.0.0.0:{}", CLIENT_FILE_PORT);

  tokio::spawn(async move {
    let listener = TcpListener::bind(&addr).await.expect("监听地址绑定失败");
    let file_listener = TcpListener::bind(file_addr).await.expect("监听地址绑定失败");
    println!("监听地址: {}", listener.local_addr().unwrap());
    println!("监听端口: {}", CLIENT_PORT);

    while let Ok((mut client_socket, _)) = listener.accept().await {
      tokio::spawn(async move {
        // 单独处理每个客户端连接
        handle_client(&mut client_socket).await;
      });
    };

    while let Ok((mut file_client_socket, _)) = file_listener.accept().await {
      tokio::spawn(async move {
        // 单独处理每个客户端连接
        handle_file_client(&mut file_client_socket).await;
      });
    };
  });
}

/**
 * 处理客户端连接
 */
async fn handle_client(client_socket: &mut TcpStream) {
  // 读取确认消息
  let mut confirmation_buf = [0; 2048];

  while client_socket.readable().await.is_ok() {
    match client_socket.try_read(&mut confirmation_buf) {
      Ok(n) => {
        let confirmation_msg = String::from_utf8_lossy(&confirmation_buf[..n]);
        transfer_recever_message(confirmation_msg.to_string(), client_socket).await;
      },
      Err(e) => {
        println!("读取确认消息失败: {}", e);
      }
    }
    sleep(Duration::from_secs(5)).await;
  };
}

async fn handle_file_client(file_client_socket: &mut TcpStream) {
  // 读取确认消息
  let mut confirmation_buf = [0; 2048];

  while file_client_socket.readable().await.is_ok() {
    match file_client_socket.try_read(&mut confirmation_buf) {
      Ok(n) => {
        let confirmation_msg = String::from_utf8_lossy(&confirmation_buf[..n]);
        transfer_recever_message(confirmation_msg.to_string(), file_client_socket).await;
      },
      Err(e) => {
        println!("读取确认消息失败: {}", e);
      }
    }
    sleep(Duration::from_secs(5)).await;
  };
}

/**
 * 处理接收到的确认消息
 */
async fn transfer_recever_message(message: String, client_socket: &mut TcpStream) {
  println!("收到消息: {}", message);
  let json_message = serde_json::from_str::<SendMessage<Value>>(&message);
  let window = get_global_window();

  match json_message {
    Ok(parse_message) => {
      match parse_message.msg_type.as_str() {
        "confirm" => {
          let send_file_info = serde_json::from_value::<SendFileInfo>(parse_message.playload.clone())
          .expect("解析 SendFileInfo 失败");
          let recevire_message = SendMessage {
            msg_type: "recevier_confirm".to_string(),
            playload: send_file_info.clone()
          };
          let buf = serde_json::to_string(&recevire_message).unwrap();
          let _ = client_socket.try_write(buf.as_bytes());
          window.emit::<SendFileInfo>("anyDrop://send_file_confirmation", send_file_info.clone()).expect("发送确认消息失败");
          println!("接收到确认消息: {:?}", send_file_info.clone());
        },
        // 接收者确认消息
        "recevier_confirm" => {
          println!("接收到接收者确认消息: {:?}", parse_message.clone());
          let file_info = serde_json::from_value::<SendFileInfo>(parse_message.playload.clone()).unwrap();
          let mut i = 0;
          while i < file_info.clone().files.len()  {
            let send_current_file_message = SendMessage {
              msg_type: "send_current_file".to_string(),
              playload: file_info.clone().files[i].clone()
            };
            let send_message_string = serde_json::to_string(&send_current_file_message).unwrap();
            if client_socket.writable().await.is_ok() {
              match client_socket.try_write(send_message_string.as_bytes()) {
                Ok(_) => {
                  println!("发送当前文件消息成功");
                  while client_socket.readable().await.is_ok() {
                    let mut r = [0u8; 8]; //8 byte buffer
                    client_socket.read(&mut r).await.unwrap();
                    let confirmation_msg = String::from_utf8_lossy(&r[..]);
                    if confirmation_msg.to_string() == "confirm" {
                      println!("接收到确认消息confirm: {}", confirmation_msg.to_string());
                      let file_path = file_info.clone().files[i].path.clone();
                      let mut f = File::open(file_path.clone()).await.unwrap();
                      if client_socket.writable().await.is_ok() {
                        match tokio::io::copy(&mut f,  client_socket).await {
                          Ok(_) => {
                            println!("发送文件成功");
                            break;
                          },
                          Err(err) => {
                            // Handle error
                            println!("Error: {:?}", err);
                          }
                        }
                      }
                    }
                  }
                },
                Err(e) => {
                  println!("发送当前文件消息失败: {:?}", e);
                }
              }
            }

            i += 1;
          }
        },
        "file_data" => {
          let file_message = serde_json::from_value::<FileMessage>(parse_message.playload.clone()).unwrap();
          let file_name = file_message.clone().file_name;
          let file_data = file_message.clone().file_data;
          let mut f = File::create(file_name.clone()).await.unwrap();
          let mut writer = BufWriter::new(f);
          if client_socket.writable().await.is_ok() {
            match tokio::io::copy(client_socket, &mut writer).await {
              Ok(_) => {
                println!("接收文件成功");
              },
              Err(err) => {
                // Handle error
                println!("Error: {:?}", err);
              }
            }
          }
        },
        "send_current_file" => {
          let send_current_file_info = serde_json::from_value::<FileInfoItem>(parse_message.playload.clone()).expect("解析 FileInfoItem 失败");

          let file_path = send_current_file_info.path.clone();
          let file_size = std::fs::metadata(file_path.clone()).unwrap().len();

          let _ = client_socket.write_all(b"confirm");

          if client_socket.readable().await.is_ok() {
            let f = File::create("/Users/cavinhuang/Downloads/使用说明2.txt".to_string()).await.expect("创建文件失败");
            let mut reader = client_socket;
            let mut writer = f;
            let result = tokio::io::copy(&mut reader, &mut writer).await;
          }

          // // send_current_file_info.path.clone()
          // let f = File::create("/Users/cavinhuang/Downloads/使用说明2.txt".to_string()).await.expect("创建文件失败");
          // let mut reader = client_socket;
          // let mut writer = f;

          // let result = tokio::io::copy(&mut reader, &mut writer).await;

          // match result {
          //   Ok(transferred) => {
          //     let _ = window
          //         .emit("fileTransferProgress", SendFileProgress {
          //           file_path: send_current_file_info.path.to_string(),
          //           progress: Progress {
          //             total: send_current_file_info.size,
          //             transferred: transferred
          //           }
          //         });
          //   }
          //   Err(err) => {
          //     // Handle error
          //     println!("send_current_file Error: {:?}", err);
          //   }
          // }
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
      // let messages: Vec<_> = message.split("||").collect();
      // if messages.len() > 1 {
      //   let file_name = messages[0];
      //   let file_data = messages[1];

      //   let f = File::create("/Users/cavinhuang/Downloads/使用说明2.jpeg".to_string()).await.expect("创建文件失败");
      //   let mut reader = client_socket;
      //   let mut writer = f;

      //   let result = tokio::io::copy(&mut reader, &mut writer).await;

      // }
      // println!("============{:?}", messages);
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
          // path: "C:\\Users\\Administrator\\Desktop\\test.txt".to_string(),
          path: "/Users/cavinhuang/Downloads/20230921-144908.jpeg".to_string()
        }
      ]
    };
    let send_message = SendMessage {
      msg_type: "confirm".to_string(),
      playload: file_info.clone()
    };
    // let send_message_value = serde_json::to_value(&send_message).unwrap();
    let send_mesage_string = serde_json::to_string(&send_message).unwrap();
    let confirmation_msg = send_mesage_string.as_bytes();
    // let _ = target_socket.writable().await;

    if target_socket.writable().await.is_ok() {
      match target_socket.try_write(confirmation_msg) {
        Ok(_) => {
          println!("发送确认消息成功");
          // target_socket.shutdown().await.expect("关闭连接失败");
          if target_socket.readable().await.is_ok() {
            let mut confirmation_buf = [0; 2048];
            match target_socket.try_read(&mut confirmation_buf) {
              Ok(n) => {
                // 拿到返回之后的信息
                let confirmation_msg = String::from_utf8_lossy(&confirmation_buf[..n]);
                println!("接收到ququs消息: {}", confirmation_msg.to_string());
                transfer_recever_message(confirmation_msg.to_string(), &mut target_socket).await;
                // println!("接收到确认消息: {}", confirmation_msg);
                // client_socket.shutdown().await.expect("关闭连接失败");
              },
              Err(e) => {
                println!("读取确认消息失败: {}", e);
                return Err(e.to_string());
              }
            }
          }
        },
        Err(e) => {
          println!("发送确认消息失败: {}", e);
          return Err(e.to_string());
        }
      }
    }
    // drop(target_socket);
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

fn send_file_service(client_socket: TcpStream, files: &Vec<FileInfoItem>) {

}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct SendFileProgress {
  file_path: String,
  progress: Progress
}

async fn start_file_transfer(
  file_path: &String,
  client_socket: &mut TcpStream
) -> Result<(), String> {
  let file_size = std::fs::metadata(file_path).unwrap().len();

  let (progress_sender, mut progress_receiver) = mpsc::channel::<Progress>(32);

  let file_path_owned = file_path.to_owned();

  let file = File::open(file_path_owned).await.expect("打开文件失败");
  let mut progress = Progress::new(file_size);

  let mut reader = file;
  let mut writer = client_socket;

  if writer.writable().await.is_ok() {
    match tokio::io::copy(&mut reader, &mut writer).await {
      Ok(transferred) => {
        // progress.update(transferred);
        // let _ = progress_sender.send(progress.clone()).await;
      }
      Err(err) => {
        // Handle error
        println!("Error: {:?}", err);
      }
    }
  }

  while let Some(updated_progress) = progress_receiver.recv().await {
    let window = get_global_window();
    let _ = window
        .emit("fileTransferProgress", SendFileProgress {
          file_path: file_path.to_string(),
          progress: updated_progress
        });
  }

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