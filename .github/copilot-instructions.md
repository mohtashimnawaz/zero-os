# ZeroOS - On-Chain Personal Operating System

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
ZeroOS is a fully on-chain personal operating system built on the Internet Computer (IC) blockchain. Each user gets their own decentralized workspace with file storage, notes, tasks, and more.

## Tech Stack
- **Backend**: Rust canisters running on Internet Computer
- **Frontend**: React with TypeScript, Tabler UI components
- **Authentication**: Internet Identity (II) or WebAuthn
- **Storage**: IC stable memory for text/metadata, blob storage for files
- **UI Framework**: Drag-n-drop with Konva.js or Framer Motion
- **File Handling**: Chunked upload to canisters (Base64 or raw binary)

## Architecture Guidelines
- Each user has their own personal canister for isolation
- File system simulation using stable memory structures
- Chunked upload for large files to handle IC message limits
- Decentralized storage with proper metadata management
- Real-time UI updates with optimistic rendering

## Development Guidelines
- Use IC CDK for Rust canister development
- Implement proper error handling and state management
- Follow security best practices for on-chain applications
- Use TypeScript for type safety across frontend and backend
- Implement proper file chunking for uploads >2MB
- Use stable memory for persistence across canister upgrades

## Key Features to Implement
- Personal file system with folders and files
- Drag-and-drop file upload interface
- Note-taking and task management
- Internet Identity authentication
- Real-time file synchronization
- File sharing and permissions
- Search and organization tools
