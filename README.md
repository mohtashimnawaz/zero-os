# ZeroOS - On-Chain Personal Operating System

🔗 **Fully On-Chain** • **Pure Decentralization** • **Internet Computer Blockchain**

ZeroOS is a revolutionary on-chain personal operating system that gives every user their own decentralized workspace. Built on the Internet Computer blockchain, it provides secure, decentralized storage for files, notes, tasks, and more.

## ✨ Features

- **🔐 Internet Identity Authentication** - Secure, passwordless login
- **📁 Decentralized File System** - Store files directly on the blockchain
- **📝 Note Taking** - Rich text notes with tagging and organization
- **✅ Task Management** - Personal task tracking with priorities and due dates
- **🔄 Real-time Sync** - Instant updates across all devices
- **🎨 Modern UI** - Beautiful, responsive interface built with Tabler
- **📱 Drag & Drop** - Intuitive file upload and organization
- **🔍 Search** - Find your content quickly and easily

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend Logic** | Rust canisters per user |
| **Storage** | IC stable memory + Blob storage |
| **Authentication** | Internet Identity (II) |
| **UI Framework** | React with TypeScript |
| **Design System** | Tabler UI components |
| **Drag-n-Drop** | Konva.js & Framer Motion |
| **File Handling** | Chunked upload to canisters |

## 🚀 Getting Started

### Prerequisites

- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install) (latest version)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://rustup.rs/) (for canister development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zero-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the local Internet Computer replica**
   ```bash
   dfx start --background
   ```

4. **Deploy the canisters**
   ```bash
   dfx deploy
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

Your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

## 🏗 Architecture

### Backend (Rust Canisters)
- **Personal Canisters**: Each user gets their own canister for isolation
- **Stable Memory**: Persistent storage that survives canister upgrades
- **Chunked Upload**: Large files are split into chunks for IC message limits
- **CRUD Operations**: Full create, read, update, delete for files, notes, and tasks

### Frontend (React + TypeScript)
- **Modern React**: Functional components with hooks
- **TypeScript**: Type-safe development
- **Context API**: State management for auth and file system
- **Responsive Design**: Mobile-first approach with Tabler UI
- **Real-time Updates**: Optimistic UI updates

## 📝 Development

### Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Internet Computer
- `dfx generate` - Generate Candid bindings
- `dfx deploy` - Deploy canisters locally

### Project Structure

```
zero-os/
├── src/
│   ├── zero_os_backend/          # Rust canister code
│   │   ├── src/lib.rs            # Main canister logic
│   │   ├── Cargo.toml            # Rust dependencies
│   │   └── zero_os_backend.did   # Candid interface
│   └── zero_os_frontend/         # React frontend
│       ├── src/
│       │   ├── components/       # React components
│       │   ├── contexts/         # React contexts
│       │   ├── pages/           # Page components
│       │   └── declarations/    # Generated IC bindings
│       └── package.json         # Frontend dependencies
├── dfx.json                     # DFX configuration
└── README.md                    # This file
```

## 🔒 Security

- **Internet Identity**: Secure, cryptographic authentication
- **Canister Isolation**: Each user has their own canister
- **Blockchain Security**: Leverages IC's security model
- **Input Validation**: All user inputs are validated and sanitized

## 🌐 Deployment

### Local Development
```bash
dfx start --background
dfx deploy
```

### IC Mainnet
```bash
dfx deploy --network ic
```

## 📚 Learning Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [React Documentation](https://react.dev/)
- [Tabler UI Components](https://tabler.io/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ on the Internet Computer**

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
