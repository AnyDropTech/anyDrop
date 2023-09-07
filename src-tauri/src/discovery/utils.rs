use tauri::{Manager, Runtime};
use window_shadows::set_shadow;

use if_addrs::{IfAddr, Ifv4Addr};

pub fn set_window_shadow<R: Runtime>(app: &tauri::App<R>) {
  let window = app.get_window("custom").unwrap();
  set_shadow(&window, true).expect("Unsupported platform!");
}

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
