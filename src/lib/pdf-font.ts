import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

const REGULAR_VFS = "NotoSansThai-Regular.ttf";
const BOLD_VFS = "NotoSansThai-Bold.ttf";

export const THAI_FONT = "NotoSansThai";

let regularBase64: string | null = null;
let boldBase64: string | null = null;

function readBase64(filename: string): string {
  return fs.readFileSync(path.join(FONT_DIR, filename), { encoding: "base64" });
}

export function registerThaiFonts(doc: jsPDF): void {
  if (!regularBase64) regularBase64 = readBase64(REGULAR_VFS);
  if (!boldBase64) boldBase64 = readBase64(BOLD_VFS);

  doc.addFileToVFS(REGULAR_VFS, regularBase64);
  doc.addFont(REGULAR_VFS, THAI_FONT, "normal");
  doc.addFileToVFS(BOLD_VFS, boldBase64);
  doc.addFont(BOLD_VFS, THAI_FONT, "bold");
}
