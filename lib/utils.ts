import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import CryptoJS from "crypto-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Funções de Criptografia AES ---
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default_key_change_me";

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
