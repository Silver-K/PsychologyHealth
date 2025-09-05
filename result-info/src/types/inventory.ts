import type { FileInfoT } from "shared";

export interface InventoryInfoT {
  id: string;
  classification: string;
  name: string;
  applicableAge: string;
  files: FileInfoT[];
};