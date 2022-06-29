use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .setup(|app| {
      app.listen_global("readConfig", |_| {
        println!("got readConfig!");
      });

      app.listen_global("appInfo", |_| {
        println!("got appInfo!");
      });

      // app.emit_all("event-name", Payload { message: "Tauri is awesome!".into() }).unwrap();

      Ok(())
    })
    .run(context)
    .expect("error while running tauri application");
}
