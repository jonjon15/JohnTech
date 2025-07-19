import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const BLING_API_BASE = "https://www.bling.com.br/Api/v3"

// Define a schema for product data validation
const productSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres." }),
  codigo: z.string().min(1, { message: "Código deve ter pelo menos 1 caracter." }),
  preco: z.number().positive({ message: "Preço deve ser positivo." }),
  estoque: z.object({
    saldoFisico: z.number().int().nonnegative({ message: "Saldo físico não pode ser negativo." }),
  }),
  situacao: z.enum(["Ativo", "Inativo"]).optional().default("Ativo"),
})

// Standardized error response function
const createErrorResponse = (message: string, status: number) => {
  console.error(`Error: ${message} (Status: ${status})`) // Log the error
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "20"

    const pageNumber = Number.parseInt(page)
    const limitNumber = Number.parseInt(limit)

    if (Number.isNaN(pageNumber) || pageNumber < 1) {
      return createErrorResponse("Página inválida.", 400)
    }

    if (Number.isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      return createErrorResponse("Limite inválido. Deve estar entre 1 e 100.", 400)
    }

    // In a real application, get the user's access token
    // const accessToken = await getUserAccessToken(userId)

    // Mock response for demonstration
    const mockProducts = {
      data: [
        {
          id: 1,
          nome: "Produto Exemplo 1",
          codigo: "PROD001",
          preco: 99.99,
          estoque: {
            saldoFisico: 50,
          },
          situacao: "Ativo",
        },
        {
          id: 2,
          nome: "Produto Exemplo 2",
          codigo: "PROD002",
          preco: 149.99,
          estoque: {
            saldoFisico: 25,
          },
          situacao: "Ativo",
        },
      ],
      pagina: pageNumber,
      totalPaginas: 5,
      totalRegistros: 100,
    }

    // Real API call would be:
    /*
    const response = await fetch(`${BLING_API_BASE}/produtos?pagina=${page}&limite=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch products from Bling')
    }
    
    const products = await response.json()
    */

    console.log("Products fetched successfully.") // Log successful fetch
    return NextResponse.json(mockProducts)
  } catch (error) {
    console.error("Products fetch error:", error)
    return createErrorResponse("Falha ao buscar produtos.", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate product data against the schema
    try {
      productSchema.parse(productData)
    } catch (validationError: any) {
      console.error("Product validation error:", validationError.errors)
      return createErrorResponse(
        `Erro de validação: ${validationError.errors.map((e: any) => e.message).join(", ")}`,
        400,
      )
    }

    // In a real application:
    // 1. Validate product data (done above)
    // 2. Get user's access token
    // 3. Create product in Bling
    // 4. Return created product

    // Mock creation
    const createdProduct = {
      id: Date.now(),
      ...productData,
      situacao: "Ativo",
      dataCriacao: new Date().toISOString(),
    }

    console.log("Product created successfully:", createdProduct) // Log successful creation
    return NextResponse.json(createdProduct, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return createErrorResponse("Falha ao criar produto.", 500)
  }
}
