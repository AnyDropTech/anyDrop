use if_addrs::{IfAddr, Ifv4Addr};
use names::Generator;
use rand::Rng;

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

/**
 * Generate a random number
 *
 * # Arguments
 *
 * * `limit` - The number of digits in the random number (default: 4)
 *
 * # Returns
 *
 * A random number as a String.
 */
pub fn random_num(limit: usize) -> String {
  const CHARACTERS: &str = "0123456789";
  let mut rng = rand::thread_rng();
  let mut result = String::new();

  for _ in 0..limit {
    let random_index = rng.gen_range(0..CHARACTERS.len());
    let random_char = CHARACTERS.chars().nth(random_index).unwrap();
    result.push(random_char);
  }
  result
}


pub fn generate_uuid() -> String {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let mut result = String::new();

  for i in 0..4 {
    for _ in 0..4 {
      let random_index = rand::thread_rng().gen_range(0..characters.len());
      result.push(characters.chars().nth(random_index).unwrap());
    }
    if i < 3 {
      result.push('-');
    }
  }

  result
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

pub fn generate_magic_string() -> String {
  let mut generator = Generator::default();
  generator.next().unwrap()
}