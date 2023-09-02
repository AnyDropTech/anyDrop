use local_ipaddress;

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
    .invoke_handler(tauri::generate_handler![count, get_locale_ip])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
