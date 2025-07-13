use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// File system structures
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FileInfo {
    pub id: String,
    pub name: String,
    pub file_type: String,
    pub size: u64,
    pub created_at: u64,
    pub updated_at: u64,
    pub parent_folder: Option<String>,
    pub owner: Principal,
    pub content_chunks: Vec<String>, // Chunk IDs for large files
    pub is_folder: bool,
    pub metadata: HashMap<String, String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct FileChunk {
    pub id: String,
    pub file_id: String,
    pub chunk_index: u32,
    pub data: Vec<u8>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub owner: Principal,
    pub tags: Vec<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub completed: bool,
    pub created_at: u64,
    pub updated_at: u64,
    pub due_date: Option<u64>,
    pub owner: Principal,
    pub priority: String,
}

// Storable implementations
impl Storable for FileInfo {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

impl Storable for FileChunk {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

impl Storable for Note {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

impl Storable for Task {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Unbounded;
}

// Global state
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static FILES: RefCell<StableBTreeMap<String, FileInfo, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))))
    );

    static CHUNKS: RefCell<StableBTreeMap<String, FileChunk, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))))
    );

    static NOTES: RefCell<StableBTreeMap<String, Note, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))))
    );

    static TASKS: RefCell<StableBTreeMap<String, Task, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))))
    );
}

// Utility functions
fn generate_id() -> String {
    let time = time();
    let mut hasher = Sha256::new();
    hasher.update(time.to_be_bytes());
    hasher.update(ic_cdk::caller().as_slice());
    format!("{:x}", hasher.finalize())
}

fn get_current_time() -> u64 {
    time()
}

// File system operations
#[update]
fn create_folder(name: String, parent_folder: Option<String>) -> Result<FileInfo, String> {
    let caller = ic_cdk::caller();
    let id = generate_id();
    let current_time = get_current_time();

    let folder = FileInfo {
        id: id.clone(),
        name,
        file_type: "folder".to_string(),
        size: 0,
        created_at: current_time,
        updated_at: current_time,
        parent_folder,
        owner: caller,
        content_chunks: vec![],
        is_folder: true,
        metadata: HashMap::new(),
    };

    FILES.with(|files| {
        files.borrow_mut().insert(id, folder.clone());
    });

    Ok(folder)
}

#[update]
fn upload_file_chunk(
    file_id: String,
    chunk_index: u32,
    data: Vec<u8>,
    file_name: String,
    file_type: String,
    total_size: u64,
    parent_folder: Option<String>,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let chunk_id = format!("{}_{}", file_id, chunk_index);
    let current_time = get_current_time();

    // Store chunk
    let chunk = FileChunk {
        id: chunk_id.clone(),
        file_id: file_id.clone(),
        chunk_index,
        data,
    };

    CHUNKS.with(|chunks| {
        chunks.borrow_mut().insert(chunk_id.clone(), chunk);
    });

    // Update or create file info
    FILES.with(|files| {
        let mut files_map = files.borrow_mut();
        if let Some(mut file_info) = files_map.get(&file_id) {
            file_info.content_chunks.push(chunk_id.clone());
            file_info.updated_at = current_time;
            files_map.insert(file_id.clone(), file_info);
        } else {
            let file_info = FileInfo {
                id: file_id.clone(),
                name: file_name,
                file_type,
                size: total_size,
                created_at: current_time,
                updated_at: current_time,
                parent_folder,
                owner: caller,
                content_chunks: vec![chunk_id.clone()],
                is_folder: false,
                metadata: HashMap::new(),
            };
            files_map.insert(file_id, file_info);
        }
    });

    Ok(chunk_id)
}

#[query]
fn get_file_info(file_id: String) -> Result<FileInfo, String> {
    FILES.with(|files| {
        files.borrow().get(&file_id).ok_or("File not found".to_string())
    })
}

#[query]
fn get_file_chunk(chunk_id: String) -> Result<FileChunk, String> {
    CHUNKS.with(|chunks| {
        chunks.borrow().get(&chunk_id).ok_or("Chunk not found".to_string())
    })
}

#[query]
fn list_files(folder_id: Option<String>) -> Vec<FileInfo> {
    let caller = ic_cdk::caller();
    FILES.with(|files| {
        files
            .borrow()
            .iter()
            .filter(|(_, file)| {
                file.owner == caller && file.parent_folder == folder_id
            })
            .map(|(_, file)| file.clone())
            .collect()
    })
}

#[update]
fn delete_file(file_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    FILES.with(|files| {
        let mut files_map = files.borrow_mut();
        if let Some(file) = files_map.get(&file_id) {
            if file.owner != caller {
                return Err("Unauthorized".to_string());
            }
            
            // Delete chunks
            for chunk_id in &file.content_chunks {
                CHUNKS.with(|chunks| {
                    chunks.borrow_mut().remove(chunk_id);
                });
            }
            
            files_map.remove(&file_id);
            Ok(())
        } else {
            Err("File not found".to_string())
        }
    })
}

// Notes operations
#[update]
fn create_note(title: String, content: String, tags: Vec<String>) -> Result<Note, String> {
    let caller = ic_cdk::caller();
    let id = generate_id();
    let current_time = get_current_time();

    let note = Note {
        id: id.clone(),
        title,
        content,
        created_at: current_time,
        updated_at: current_time,
        owner: caller,
        tags,
    };

    NOTES.with(|notes| {
        notes.borrow_mut().insert(id, note.clone());
    });

    Ok(note)
}

#[update]
fn update_note(note_id: String, title: String, content: String, tags: Vec<String>) -> Result<Note, String> {
    let caller = ic_cdk::caller();
    let current_time = get_current_time();

    NOTES.with(|notes| {
        let mut notes_map = notes.borrow_mut();
        if let Some(mut note) = notes_map.get(&note_id) {
            if note.owner != caller {
                return Err("Unauthorized".to_string());
            }
            
            note.title = title;
            note.content = content;
            note.tags = tags;
            note.updated_at = current_time;
            
            notes_map.insert(note_id, note.clone());
            Ok(note)
        } else {
            Err("Note not found".to_string())
        }
    })
}

#[query]
fn get_notes() -> Vec<Note> {
    let caller = ic_cdk::caller();
    NOTES.with(|notes| {
        notes
            .borrow()
            .iter()
            .filter(|(_, note)| note.owner == caller)
            .map(|(_, note)| note.clone())
            .collect()
    })
}

#[update]
fn delete_note(note_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    NOTES.with(|notes| {
        let mut notes_map = notes.borrow_mut();
        if let Some(note) = notes_map.get(&note_id) {
            if note.owner != caller {
                return Err("Unauthorized".to_string());
            }
            notes_map.remove(&note_id);
            Ok(())
        } else {
            Err("Note not found".to_string())
        }
    })
}

// Task operations
#[update]
fn create_task(
    title: String,
    description: String,
    due_date: Option<u64>,
    priority: String,
) -> Result<Task, String> {
    let caller = ic_cdk::caller();
    let id = generate_id();
    let current_time = get_current_time();

    let task = Task {
        id: id.clone(),
        title,
        description,
        completed: false,
        created_at: current_time,
        updated_at: current_time,
        due_date,
        owner: caller,
        priority,
    };

    TASKS.with(|tasks| {
        tasks.borrow_mut().insert(id, task.clone());
    });

    Ok(task)
}

#[update]
fn update_task(
    task_id: String,
    title: String,
    description: String,
    completed: bool,
    due_date: Option<u64>,
    priority: String,
) -> Result<Task, String> {
    let caller = ic_cdk::caller();
    let current_time = get_current_time();

    TASKS.with(|tasks| {
        let mut tasks_map = tasks.borrow_mut();
        if let Some(mut task) = tasks_map.get(&task_id) {
            if task.owner != caller {
                return Err("Unauthorized".to_string());
            }
            
            task.title = title;
            task.description = description;
            task.completed = completed;
            task.due_date = due_date;
            task.priority = priority;
            task.updated_at = current_time;
            
            tasks_map.insert(task_id, task.clone());
            Ok(task)
        } else {
            Err("Task not found".to_string())
        }
    })
}

#[query]
fn get_tasks() -> Vec<Task> {
    let caller = ic_cdk::caller();
    TASKS.with(|tasks| {
        tasks
            .borrow()
            .iter()
            .filter(|(_, task)| task.owner == caller)
            .map(|(_, task)| task.clone())
            .collect()
    })
}

#[update]
fn delete_task(task_id: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    TASKS.with(|tasks| {
        let mut tasks_map = tasks.borrow_mut();
        if let Some(task) = tasks_map.get(&task_id) {
            if task.owner != caller {
                return Err("Unauthorized".to_string());
            }
            tasks_map.remove(&task_id);
            Ok(())
        } else {
            Err("Task not found".to_string())
        }
    })
}

// System info
#[query]
fn get_user_storage_info() -> HashMap<String, u64> {
    let caller = ic_cdk::caller();
    let mut info = HashMap::new();
    
    let (file_count, total_size) = FILES.with(|files| {
        let (mut count, mut size) = (0u64, 0u64);
        for (_, file) in files.borrow().iter() {
            if file.owner == caller {
                count += 1;
                size += file.size;
            }
        }
        (count, size)
    });
    
    let note_count = NOTES.with(|notes| {
        notes
            .borrow()
            .iter()
            .filter(|(_, note)| note.owner == caller)
            .count() as u64
    });
    
    let task_count = TASKS.with(|tasks| {
        tasks
            .borrow()
            .iter()
            .filter(|(_, task)| task.owner == caller)
            .count() as u64
    });
    
    info.insert("file_count".to_string(), file_count);
    info.insert("total_file_size".to_string(), total_size);
    info.insert("note_count".to_string(), note_count);
    info.insert("task_count".to_string(), task_count);
    
    info
}

#[init]
fn init() {
    // Initialize canister
}

#[pre_upgrade]
fn pre_upgrade() {
    // Prepare for upgrade
}

#[post_upgrade]
fn post_upgrade() {
    // Handle post-upgrade logic
}
