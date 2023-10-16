// use tauri::api::dialog::message;
use tauri::{
    utils::assets::EmbeddedAssets,
    Context,
    Menu,
    MenuItem,
    CustomMenuItem,
    Submenu,
    AboutMetadata,
    WindowMenuEvent,
};

pub fn init(context: &Context<EmbeddedAssets>) -> Menu {
    // 获取应用名称
    let name = "压鸭";
    let app_menu = Submenu::new(
        "",
        // MenuItem::About 为原生菜单
        Menu::new()
            // .add_native_item(MenuItem::About(name.into(), AboutMetadata::new()))
            .add_item(CustomMenuItem::new("about".to_string(), "关于压鸭"))
            .add_item(CustomMenuItem::new("quit".to_string(), "退出"))
    );
    // let menu_2 = Submenu::new(
    //     "123",
    //     Menu::new().add_submenu(
    //         Submenu::new(
    //             "View", // 子菜单名称
    //             Menu::new() // 子菜单项
    //                 .add_item(CustomMenuItem::new("close".to_string(), "Close")) // 自定义菜单（关闭）
    //                 .add_native_item(MenuItem::Quit) // 原生菜单（退出）
    //         )
    //     )
    // );
    Menu::new().add_submenu(app_menu)
    // .add_submenu(menu_2)
}

// 应用菜单处理事件
pub fn handler(event: WindowMenuEvent) {
    // 菜单所属的窗口
    let win = Some(event.window());
    // 匹配菜单 id
    match event.menu_item_id() {
        "about" => {
            // open_about();
        }
        "quit" => {
            std::process::exit(0);
        }
        _ => {}
    }
}

// #[tauri::command]
// async fn open_about(handle: tauri::AppHandle) {
//     let about_window = tauri::WindowBuilder
//         ::new(
//             &handle,
//             "external" /* the unique window label */,
//             tauri::WindowUrl::External("/about".parse().unwrap())
//         )
//         .build()
//         .unwrap();
// }
