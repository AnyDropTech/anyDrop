//! Service daemon for client transfer.

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct ClientTransfer {
}

impl ClientTransfer {

  pub fn send() {}

  pub fn send_file_info_message() {}

  pub fn receiver() {}

  pub fn receiver_file_info_message() {}

  pub fn discovery_files() {}
}

/**
 * 选择发送文件
 */
#[tauri::command]
fn select_send_file() -> Vec<PathBuf> {
  let files = FileDialog::new().pick_files();
  let file = files.unwrap_or_default();
  file.to_vec()
}

/**
 * 选择发送文件夹
 */
#[tauri::command]
fn select_send_dir() -> Vec<PathBuf> {
  let folders = FileDialog::new().pick_folder();
  let folder = folders.unwrap_or_default();
  folder.to_vec()
}