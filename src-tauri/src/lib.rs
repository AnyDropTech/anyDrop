
use crate::{
  utils::{set_window_shadow}
};

mod utils;

#[tauri::command]
fn count(count: i32) -> String {
  format!("React Counting to {}...", count)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_window::init())
    .setup(|app| {
      println!("Hello World!");
      set_window_shadow(app);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![count])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
