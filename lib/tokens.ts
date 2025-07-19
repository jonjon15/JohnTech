/**
 * Pequeno wrapper em volta de getBlingTokens para manter
 * compatibilidade com imports que esperam "getTokens"
 */
import { getBlingTokens } from "./db"

/**
 * Retorna o registro de tokens do Bling para um usuário.
 */
export async function getTokens(userEmail: string) {
  return getBlingTokens(userEmail)
}
