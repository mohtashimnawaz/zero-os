import React, { createContext, useContext, useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../declarations/zero_os_backend';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface FileInfo {
  id: string;
  name: string;
  file_type: string;
  size: bigint;
  created_at: bigint;
  updated_at: bigint;
  parent_folder: string | null;
  owner: string;
  content_chunks: string[];
  is_folder: boolean;
  metadata: [string, string][];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: bigint;
  updated_at: bigint;
  owner: string;
  tags: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: bigint;
  updated_at: bigint;
  due_date: bigint | null;
  owner: string;
  priority: string;
}

interface FileSystemContextType {
  files: FileInfo[];
  notes: Note[];
  tasks: Task[];
  currentFolder: string | null;
  isLoading: boolean;
  // File operations
  createFolder: (name: string, parentFolder?: string) => Promise<void>;
  uploadFile: (file: File, parentFolder?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<Blob>;
  listFiles: (folderId?: string) => Promise<void>;
  setCurrentFolder: (folderId: string | null) => void;
  // Note operations
  createNote: (title: string, content: string, tags: string[]) => Promise<void>;
  updateNote: (noteId: string, title: string, content: string, tags: string[]) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  // Task operations
  createTask: (title: string, description: string, dueDate?: Date, priority?: string) => Promise<void>;
  updateTask: (taskId: string, title: string, description: string, completed: boolean, dueDate?: Date, priority?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // System info
  getStorageInfo: () => Promise<Record<string, bigint>>;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

interface FileSystemProviderProps {
  children: React.ReactNode;
}

export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
  const { identity, isAuthenticated } = useAuth();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actor, setActor] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && identity) {
      initializeActor();
    }
  }, [isAuthenticated, identity]);

  useEffect(() => {
    if (actor) {
      loadData();
    }
  }, [actor, currentFolder]);

  const initializeActor = async () => {
    try {
      const agent = new HttpAgent({
        identity: identity || undefined,
        host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
      });

      if (process.env.DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
      }

      const canisterId = process.env.CANISTER_ID_ZERO_OS_BACKEND;
      if (!canisterId) {
        throw new Error('Backend canister ID not found');
      }

      const backendActor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });

      setActor(backendActor);
    } catch (error) {
      console.error('Failed to initialize actor:', error);
      toast.error('Failed to connect to backend');
    }
  };

  const loadData = async () => {
    if (!actor) return;

    setIsLoading(true);
    try {
      const [filesResult, notesResult, tasksResult] = await Promise.all([
        actor.list_files(currentFolder ? [currentFolder] : []),
        actor.get_notes(),
        actor.get_tasks(),
      ]);

      setFiles(filesResult);
      setNotes(notesResult);
      setTasks(tasksResult);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (name: string, parentFolder?: string) => {
    if (!actor) return;

    try {
      const result = await actor.create_folder(name, parentFolder ? [parentFolder] : []);
      if ('Ok' in result) {
        await listFiles(currentFolder || undefined);
        toast.success('Folder created successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const uploadFile = async (file: File, parentFolder?: string) => {
    if (!actor) return;

    try {
      const fileId = `${Date.now()}_${file.name}`;
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);

      toast.loading(`Uploading ${file.name}...`, { id: fileId });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        const chunkData = new Uint8Array(await chunk.arrayBuffer());

        const result = await actor.upload_file_chunk(
          fileId,
          i,
          Array.from(chunkData),
          file.name,
          file.type,
          BigInt(file.size),
          parentFolder ? [parentFolder] : []
        );

        if ('Err' in result) {
          throw new Error(result.Err);
        }
      }

      await listFiles(currentFolder || undefined);
      toast.success('File uploaded successfully', { id: fileId });
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!actor) return;

    try {
      const result = await actor.delete_file(fileId);
      if ('Ok' in result) {
        await listFiles(currentFolder || undefined);
        toast.success('File deleted successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    }
  };

  const downloadFile = async (fileId: string): Promise<Blob> => {
    if (!actor) throw new Error('Actor not initialized');

    try {
      const fileInfo = await actor.get_file_info(fileId);
      if ('Err' in fileInfo) {
        throw new Error(fileInfo.Err);
      }

      const chunks: Uint8Array[] = [];
      for (const chunkId of fileInfo.Ok.content_chunks) {
        const chunkResult = await actor.get_file_chunk(chunkId);
        if ('Err' in chunkResult) {
          throw new Error(chunkResult.Err);
        }
        chunks.push(new Uint8Array(chunkResult.Ok.data));
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const fullData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        fullData.set(chunk, offset);
        offset += chunk.length;
      }

      return new Blob([fullData], { type: fileInfo.Ok.file_type });
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  };

  const listFiles = async (folderId?: string) => {
    if (!actor) return;

    try {
      const result = await actor.list_files(folderId ? [folderId] : []);
      setFiles(result);
    } catch (error) {
      console.error('Failed to list files:', error);
      toast.error('Failed to load files');
    }
  };

  const createNote = async (title: string, content: string, tags: string[]) => {
    if (!actor) return;

    try {
      const result = await actor.create_note(title, content, tags);
      if ('Ok' in result) {
        setNotes(prev => [...prev, result.Ok]);
        toast.success('Note created successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  const updateNote = async (noteId: string, title: string, content: string, tags: string[]) => {
    if (!actor) return;

    try {
      const result = await actor.update_note(noteId, title, content, tags);
      if ('Ok' in result) {
        setNotes(prev => prev.map(note => note.id === noteId ? result.Ok : note));
        toast.success('Note updated successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!actor) return;

    try {
      const result = await actor.delete_note(noteId);
      if ('Ok' in result) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  const createTask = async (title: string, description: string, dueDate?: Date, priority = 'medium') => {
    if (!actor) return;

    try {
      const result = await actor.create_task(
        title,
        description,
        dueDate ? [BigInt(dueDate.getTime())] : [],
        priority
      );
      if ('Ok' in result) {
        setTasks(prev => [...prev, result.Ok]);
        toast.success('Task created successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (
    taskId: string,
    title: string,
    description: string,
    completed: boolean,
    dueDate?: Date,
    priority = 'medium'
  ) => {
    if (!actor) return;

    try {
      const result = await actor.update_task(
        taskId,
        title,
        description,
        completed,
        dueDate ? [BigInt(dueDate.getTime())] : [],
        priority
      );
      if ('Ok' in result) {
        setTasks(prev => prev.map(task => task.id === taskId ? result.Ok : task));
        toast.success('Task updated successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!actor) return;

    try {
      const result = await actor.delete_task(taskId);
      if ('Ok' in result) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast.success('Task deleted successfully');
      } else {
        throw new Error(result.Err);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const getStorageInfo = async (): Promise<Record<string, bigint>> => {
    if (!actor) return {};

    try {
      const result = await actor.get_user_storage_info();
      return Object.fromEntries(result);
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {};
    }
  };

  const value: FileSystemContextType = {
    files,
    notes,
    tasks,
    currentFolder,
    isLoading,
    createFolder,
    uploadFile,
    deleteFile,
    downloadFile,
    listFiles,
    setCurrentFolder,
    createNote,
    updateNote,
    deleteNote,
    createTask,
    updateTask,
    deleteTask,
    getStorageInfo,
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
};
