use tauri::{Window, Theme};


#[tauri::command]
pub fn get_current_window_theme(window: Window) -> Theme{
  let theme = window.theme().unwrap();
  theme
}