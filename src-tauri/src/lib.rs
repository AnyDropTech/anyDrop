use local_ipaddress;
use std::net::{UdpSocket, SocketAddr, Ipv4Addr, IpAddr};
use std::time::Duration;

#[tauri::command]
fn broadcast_message(message: String, port: u16) -> Result<(), String> {
    println!("Broadcasting message: {}, port: {}", message, port);
    // 创建UDP套接字并绑定到指定端口
    let socket = UdpSocket::bind(format!("0.0.0.0:{}", port)).map_err(|e| e.to_string())?;

    // 设置广播选项
    socket.set_broadcast(true).map_err(|e| e.to_string())?;

    // 定义广播地址
    let ip_address = Ipv4Addr::new(255, 255, 255, 255);
    let broadcast_addr = SocketAddr::new(IpAddr::V4(ip_address), port);

    // 发送消息到广播地址
    socket.send_to(message.as_bytes(), broadcast_addr).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn listen_for_broadcast(port: u16) -> Result<String, String> {
    // 创建UDP套接字并绑定到指定端口
    let socket = UdpSocket::bind(format!("0.0.0.0:{}", port)).map_err(|e| e.to_string())?;

    // 设置读取超时时间为1秒，可以根据需要调整
    socket.set_read_timeout(Some(Duration::from_secs(1))).map_err(|e| e.to_string())?;

    // 定义一个缓冲区来接收消息
    let mut buffer = [0; 1024];

    loop {
        match socket.recv_from(&mut buffer) {
            Ok((num_bytes, _)) => {
                // 将接收到的消息转换为字符串
                let message = String::from_utf8_lossy(&buffer[..num_bytes]).to_string();
                return Ok(message);
            }
            Err(e) => {
                // 超时或其他错误，继续等待
                println!("Error receiving broadcast: {}", e.to_string());
                return Err(e.to_string());
            }
        }
    }
}


#[tauri::command]
fn get_locale_ip() -> String {
  let ip = local_ipaddress::get().unwrap();
  println!("ip, {}", ip);
  format!("{}", ip)
}

#[tauri::command]
fn count(count: i32) -> String {
  format!("React Counting to {}...", count)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![count, get_locale_ip, broadcast_message, listen_for_broadcast])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
