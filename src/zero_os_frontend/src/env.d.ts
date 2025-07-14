/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DFX_NETWORK?: string;
  readonly VITE_CANISTER_ID_ZERO_OS_BACKEND?: string;
  readonly VITE_CANISTER_ID_ZERO_OS_FRONTEND?: string;
  readonly VITE_CANISTER_ID_INTERNET_IDENTITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
