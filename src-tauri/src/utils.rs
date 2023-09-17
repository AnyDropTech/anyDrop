use if_addrs::{IfAddr, Ifv4Addr};
use names::Generator;

// use tauri::{Runtime, Manager};

// pub fn query_service_event_handler<R: Runtime>(app: &tauri::App<R>) {
//   // 处理窗口事件并通知窗口更新
//   let window = app.get_window("custom").unwrap();
//   let _ = window.emit_all("query_service_event", Some("data to update with"));
// }

// pub fn set_window_shadow<R: Runtime>(app: &tauri::App<R>) {
//   let window = app.get_window("custom").unwrap();
//   set_shadow(&window, true).expect("Unsupported platform!");
// }

pub fn my_ipv4_interfaces() -> Vec<Ifv4Addr> {
  if_addrs::get_if_addrs()
    .unwrap_or_default()
    .into_iter()
    .filter_map(|i| {
        if i.is_loopback() {
            None
        } else {
            match i.addr {
                IfAddr::V4(ifv4) => Some(ifv4),
                _ => None,
            }
        }
    })
    .collect()
}

pub fn generate_magic_string() -> String {
  let mut generator = Generator::default();
  generator.next().unwrap()
}