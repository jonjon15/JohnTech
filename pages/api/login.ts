import type { NextApiRequest, NextApiResponse } from "next";

// Exemplo simples: substitua por consulta real ao banco
const users = [
  { id: 1, name: "Johnny", email: "johnny@teste.com", password: "123456" },
  { id: 2, name: "Maria", email: "maria@teste.com", password: "abcdef" },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha inválidos" });
  }
  // Retorne apenas dados seguros
  return res.status(200).json({ id: user.id, name: user.name, email: user.email });
}
