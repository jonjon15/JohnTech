import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <section className="w-full max-w-2xl text-center flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8 text-neutral-900 animate-fadein">
          📚 Documentação JohnTech
        </h1>
        <ul className="space-y-4 mb-10 animate-fadein delay-100">
          <li><Link href="/docs/homologacao/README.md" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Guia de Homologação</Link></li>
          <li><Link href="/docs/homologacao/endpoints.md" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Documentação Técnica dos Endpoints</Link></li>
          <li><Link href="/docs/homologacao/examples.md" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Exemplos de Uso</Link></li>
          <li><Link href="/docs/homologacao/errors.md" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Códigos de Erro</Link></li>
          <li><Link href="/docs/homologacao/changelog.md" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Changelog</Link></li>
          <li><Link href="/docs/api/openapi.yaml" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">OpenAPI/Swagger</Link></li>
          <li><Link href="/docs/api/postman-collection.json" target="_blank" className="text-blue-700 font-semibold underline hover:text-blue-900 transition">Collection Postman</Link></li>
        </ul>
        <footer className="text-neutral-400 text-sm animate-fadein delay-200">
          Última atualização: 22/07/2025
        </footer>
      </section>
    </main>
  );
}
