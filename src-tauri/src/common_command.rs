use serde::{Serialize, Serializer};
use tauri::{
  utils::config::{WindowConfig, WindowEffectsConfig},
  AppHandle, CursorIcon, Icon, Manager, Monitor, PhysicalPosition, PhysicalSize, Position,
  Runtime, Size, Theme, UserAttentionType, Window,
};
use crate::error::Result;


#[tauri::command]
pub fn theme<R: Runtime>(window: Window<R>, label: Option<String>) -> Result<Theme> {
  get_window(window, label)?.theme()
}

fn get_window<R: Runtime>(window: Window<R>, label: Option<String>) -> Result<Window<R>> {
  match label {
      Some(l) if !l.is_empty() => window.get_window(&l),
      _ => Ok(window),
  }
}