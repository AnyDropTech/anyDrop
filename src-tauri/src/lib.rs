use local_ipaddress;
use std::net::{IpAddr, Ipv4Addr, SocketAddr, UdpSocket};
use std::thread;

#[tauri::command]
fn list_network_devices() -> Result<Vec<String>, String> {
    let mut devices = Vec::new();

    // 扫描局域网设备
    for i in 1..255 {
        let ip = Ipv4Addr::new(192, 168, 3, i);
        let socket = UdpSocket::bind(SocketAddr::new(IpAddr::V4(ip), 0)).map_err(|e| e.to_string())?;
        socket.set_read_timeout(Some(std::time::Duration::from_secs(1))).map_err(|e| e.to_string())?;

        // 向设备发送请求并等待响应
        let request = "IsNetworked".as_bytes();
        let target_addr = SocketAddr::new(IpAddr::V4(ip), 12345);
        socket.send_to(request, target_addr).map_err(|e| e.to_string())?;

        let mut response = [0u8; 128];
        if let Ok((num_bytes, _)) = socket.recv_from(&mut response) {
            let message = String::from_utf8_lossy(&response[..num_bytes]).to_string();
            if message == "Yes" {
                devices.push(ip.to_string());
            }
        }
    }

    Ok(devices)
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
    .invoke_handler(tauri::generate_handler![count, get_locale_ip, list_network_devices])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
