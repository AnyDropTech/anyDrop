#[tauri::command]
pub fn start_disconvery() {}

#[tauri::command]
fn stop_discovery() {}

#[tauri::command]
fn select_send_files() {}

#[tauri::command]
fn receiver_files() {}

#[tauri::command]
fn send_files() {}