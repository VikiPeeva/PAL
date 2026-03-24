use tauri_plugin_dialog::{DialogExt, FilePath};
use std::fs;
use std::path::Path;

#[tauri::command]
fn pick_files(app: tauri::AppHandle, extensions: Vec<String>) -> Vec<String> {
    let ext_refs: Vec<&str> = extensions.iter().map(|s| s.as_str()).collect();
    app.dialog()
        .file()
        .add_filter("Process Mining Files", &ext_refs)
        .blocking_pick_files()
        .unwrap_or_default()
        .into_iter()
        .filter_map(|fp| {
            if let FilePath::Path(path) = fp {
                Some(path.to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect()
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let content = fs::read_to_string(Path::new(&path)).map_err(|e| e.to_string())?;
    Ok(content)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![pick_files, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}