// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod menu;

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder
        ::default()
        // .setup(|app| {
        //     let handle = app.handle();
        //     std::thread::spawn(move || {
        //         let local_window = tauri::WindowBuilder
        //             ::new(&handle, "local", tauri::WindowUrl::App("/about".into()))
        //             .build()?;
        //     });
        //     Ok(())
        // })
        .menu(menu::init(&context)) // 将菜单添加到所有窗口
        .on_menu_event(menu::handler)
        // .invoke_handler(tauri::generate_handler![print])
        .run(context)
        .expect("error while running tauri application");
}

#[tauri::command]
fn print(val: String) {
    println!("{}", val);
}
