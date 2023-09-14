pub mod discovery;
pub mod send;
pub mod utils;
use local_ipaddress;
use std::{fs::metadata, path::PathBuf};
use tauri::{Runtime, Window};

use rfd::FileDialog;

use discovery::{query_handler, register_service, unregister, ClientDevice, PORT};
use send::send_file;
use tokio::sync::oneshot;

use crate::send::send_msg;

#[tauri::command]
fn start_discovery_command() {
    // register_service();
}

#[tauri::command]
fn get_user_savepath() -> String {
    let folder = FileDialog::new().pick_folder();
    let folder = folder.unwrap_or_default();
    String::from(folder.to_str().unwrap_or_default())
}

#[tauri::command]
fn select_send_file() -> Vec<PathBuf> {
    let files = FileDialog::new().pick_files();
    let folder = files.unwrap_or_default();
    folder.to_vec()
}

#[tauri::command]
fn start_broadcast_command(data: ClientDevice) {
    println!("++++++++++++++++data: {:?}", data);
    let _res = register_service(data);

    format!("{}", "success");
}

#[tauri::command]
fn unregister_service(password: &str) {
    println!("++++++++++++++++data: {:?}", password);
    let _res = unregister(password);

    format!("{}", "success");
}

#[tauri::command]
fn query_service(window: Window, password: &str) -> String {
    query_handler(window, password);
    let a = "success".to_string();
    a
}

#[tauri::command]
fn get_locale_ip() -> String {
    let ip = local_ipaddress::get().unwrap();
    println!("ip, {}", ip);
    format!("{}", ip)
}

#[tauri::command]
fn send_file_client<R: Runtime>(window: tauri::Window<R>, file_path: &str, password: &str) -> String {
    let (tx, rx) = oneshot::channel();

    let file_size = metadata(file_path).unwrap().len();
    println!("file_size: {:?}", file_size);

    let own_file_path = file_path.to_owned();
    let own_password = password.to_owned();

    tokio::spawn(async move {
      let port = send_file(PORT, &own_file_path, file_size, tx).await;
      println!("listener port{:?}", port);
      let _ = send_msg(
        &own_password,
        port.unwrap(),
        [
            ("name".into(), own_file_path.into()),
            ("size".into(), file_size.to_string()),
        ]
        .into(),
      );
      rx.await
    });

    let a = "success".to_string();
    a
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            get_locale_ip,
            start_broadcast_command,
            start_discovery_command,
            query_service,
            get_user_savepath,
            unregister_service,
            send_file_client,
            select_send_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
