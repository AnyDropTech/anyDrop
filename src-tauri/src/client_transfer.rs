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