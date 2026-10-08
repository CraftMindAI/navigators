declare module 'read-excel-file/browser' {
  export function readSheet(file: File | Blob): Promise<any[][]>;
}
