/// <reference types="vite/client" />

declare module '@vue-office/docx/lib/v3/vue-office-docx.mjs';
declare module '@vue-office/excel/lib/v3/vue-office-excel.mjs';
declare module '@vue-office/pdf/lib/v3/vue-office-pdf.mjs';

declare interface Window {
  _resize_: () => void;
}