use tauri_plugin_dialog::{DialogExt, FilePath};
use std::fs;
use std::io::Read;
use std::path::Path;
use zip::ZipArchive;

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

#[derive(serde::Serialize)]
struct PnmlFileEntry {
    name: String,
    content: String,
}

#[tauri::command]
fn read_zip_pnmls(path: String) -> Result<Vec<PnmlFileEntry>, String> {
    let file = fs::File::open(Path::new(&path)).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
        if entry.is_dir() { continue; }
        let entry_name = entry.name().to_string();
        if !entry_name.to_lowercase().ends_with(".pnml") { continue; }
        let name = Path::new(&entry_name)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or(entry_name.clone());
        let mut content = String::new();
        entry.read_to_string(&mut content).map_err(|e| e.to_string())?;
        entries.push(PnmlFileEntry { name, content });
    }
    Ok(entries)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![pick_files, read_file, read_zip_pnmls])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}