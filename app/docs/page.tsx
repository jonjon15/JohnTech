import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">📚 Documentação JohnTech</h1>
      <ul className="space-y-3">
        <li>
          <Link href="/docs/homologacao/README.md" target="_blank" className="text-blue-600 underline">Guia de Homologação</Link>
        </li>
        <li>
          <Link href="/docs/homologacao/endpoints.md" target="_blank" className="text-blue-600 underline">Documentação Técnica dos Endpoints</Link>
        </li>
        <li>
          <Link href="/docs/homologacao/examples.md" target="_blank" className="text-blue-600 underline">Exemplos de Uso</Link>
        </li>
        <li>
          <Link href="/docs/homologacao/errors.md" target="_blank" className="text-blue-600 underline">Códigos de Erro</Link>
        </li>
        <li>
          <Link href="/docs/homologacao/changelog.md" target="_blank" className="text-blue-600 underline">Changelog</Link>
        </li>
        <li>
          <Link href="/docs/api/openapi.yaml" target="_blank" className="text-blue-600 underline">OpenAPI/Swagger</Link>
        </li>
        <li>
          <Link href="/docs/api/postman-collection.json" target="_blank" className="text-blue-600 underline">Collection Postman</Link>
        </li>
      </ul>
      <div className="mt-8 text-sm text-gray-500">
        Última atualização: 22/07/2025
      </div>
    </main>
  );
}
