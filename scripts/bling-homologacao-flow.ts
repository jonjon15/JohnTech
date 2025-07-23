import { getValidAccessToken } from '../lib/bling-auth';

async function refreshAccessToken(): Promise<string> {
  // Usa o mesmo e-mail do fluxo principal (ajuste se necessário)
  const refreshed = await getValidAccessToken('admin@johntech.com.br', true);
  if (!refreshed) throw new Error('Não foi possível renovar o access token do Bling');
  return refreshed;
}

async function homologacaoFlow() {
  let accessToken = await getValidAccessToken('admin@johntech.com.br'); // Ajuste o e-mail conforme seu ambiente
  let homologacaoHash: string | undefined;

  async function blingRequest(url: string, options: RequestInit = {}) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const headers: any = {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      };
      if (homologacaoHash) headers['x-bling-homologacao'] = homologacaoHash;

      const response = await fetch(url, { ...options, headers });
      const hash = response.headers.get('x-bling-homologacao');
      if (hash) homologacaoHash = hash;

      if (response.status === 401 || response.status === 403) {
        accessToken = await refreshAccessToken();
        continue;
      }
      return response;
    }
    throw new Error('Falha de autenticação Bling');
  }

  // 1. GET produto
  const getRes = await blingRequest('https://api.bling.com.br/Api/v3/homologacao/produtos');
  const produto = (await getRes.json()).data;

  // 2. POST produto
  const postRes = await blingRequest('https://api.bling.com.br/Api/v3/homologacao/produtos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(produto),
  });
  const produtoCriado = (await postRes.json()).data;
  const id = produtoCriado.id;

  // 3. PUT produto (altera nome)
  await blingRequest(`https://api.bling.com.br/Api/v3/homologacao/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...produtoCriado, nome: 'Copo' }),
  });

  // 4. PATCH situação
  await blingRequest(`https://api.bling.com.br/Api/v3/homologacao/produtos/${id}/situacoes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situacao: 'I' }),
  });

  // 5. DELETE produto
  await blingRequest(`https://api.bling.com.br/Api/v3/homologacao/produtos/${id}`, {
    method: 'DELETE',
  });

  console.log('Fluxo de homologação Bling executado com sucesso!');
}

homologacaoFlow().catch(console.error);
