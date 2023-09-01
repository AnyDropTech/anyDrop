
#[tauri::command]
fn count(count: i32) -> String {
  format!("React Counting to {}...", count)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![count])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
