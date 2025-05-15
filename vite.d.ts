declare module 'vite' {
  interface ServerOptions {
    middlewareMode?: boolean;
    hmr?: any;
    allowedHosts?: boolean | string[] | true;
  }
}