pub mod discovery;
pub mod send;
pub mod utils;

mod client_command;
pub mod error;
pub mod client_config;
pub mod client_connector;
pub mod global;

use anyhow::{anyhow, Context};
use global::set_app_handle;
use local_ipaddress;
use std::{fs::metadata, path::{PathBuf, Path}};
use tauri::{Runtime, Window, Manager};

use rfd::FileDialog;

use discovery::{query_handler, register_service, unregister, ClientDevice, PORT};
use send::{send_file, recv_msg};
use tokio::sync::oneshot;

use crate::send::{send_msg, recv_file, unregister_file_service};

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
fn send_file_client(file_path: &str, password: &str, receive_dir: &str) -> String {
    let (tx, rx) = oneshot::channel();

    let file_size = metadata(file_path).unwrap().len();

    let own_file_path = file_path.to_owned();
    let own_password = password.to_owned();
    let own_receive_dir = receive_dir.to_owned();

    tokio::spawn(async move {
      let port = send_file(PORT, &own_file_path, file_size, tx).await;
      println!("listener port{:?}", port);
      let mds = send_msg(
        &own_password,
        port.unwrap(),
        [
            ("name".into(), own_file_path.into()),
            ("size".into(), file_size.to_string()),
            ("is_file".into(), true.to_string()),
            ("password".into(), own_password.to_string()),
            ("receive_dir".into(), own_receive_dir.to_string())
        ]
        .into(),
      );
      // my_state.sender_mdns = mds.unwrap();
    // let mut sender_mdns = sender_ctrl.sender_mdns.lock().unwrap();
      rx.await
    });

    let a = "success".to_string();
    a
}

#[tauri::command]
fn reciver_save_file<R: Runtime>(window: tauri::Window<R>, file_path: &str, password: &str, receive_dir: &str) ->String {

  let own_password = password.to_owned();
  let own_receive_dir = receive_dir.to_owned();
  tokio::spawn(async move {
    let (addrs, port, data) = recv_msg(&own_password).unwrap();
    println!("addrs, {:?}", addrs);
    println!("port, {:?}", port);
    println!("data, {:?}", data);
    let name = Path::new(
        data.get_property_val_str("name")
            .context("`name` key must be present").unwrap(),
    )
    .file_name()
    .and_then(|x| x.to_str())
    .ok_or_else(|| anyhow!("Error while read filename"));
    let all_dir = format!("{own_receive_dir}/2023-09-14");
    let save_dir: Option<PathBuf> = Some(PathBuf::from(all_dir.to_string()));
    let file_path = save_dir.unwrap().join(name.unwrap());
    for addr in &addrs {
        println!("Trying {addr}");
        if recv_file(
            addr,
            port,
            &all_dir,
            &file_path,
            data.get_property_val_str("size")
                .context("`size` key must be present").unwrap().parse().unwrap()
        )
        .await
        .is_ok()
        {
            println!("File is received. Breaking loop");
            unregister_file_service(&own_password);
            break;
        }
    }
  });

  let a = "success".to_string();
  a
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // let m = Mutex::new(state);
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
          set_app_handle(app.handle().clone());
          Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_locale_ip,
            start_broadcast_command,
            start_discovery_command,
            query_service,
            get_user_savepath,
            unregister_service,
            send_file_client,
            select_send_file,
            reciver_save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
