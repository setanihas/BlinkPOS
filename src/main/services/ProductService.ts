import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductQuery,
  Paginated
} from '@shared/domain'
import { productSchema } from '@shared/schemas'
import { ProductRepository } from '../repositories/ProductRepository'

/** Business logic for products: validation, uniqueness, normalisation. */
export class ProductService {
  constructor(private readonly repo: ProductRepository = new ProductRepository()) {}

  list(query: ProductQuery): Paginated<Product> {
    return this.repo.list(query)
  }

  getById(id: string): Product | null {
    return this.repo.getById(id)
  }

  getByBarcode(barcode: string): Product | null {
    return this.repo.getByBarcode(barcode.trim())
  }

  create(dto: CreateProductDTO): Product {
    const parsed = productSchema.parse(dto)
    const existing = this.repo.getByBarcode(parsed.barcode)
    if (existing) {
      throw new Error('A product with this barcode already exists')
    }
    return this.repo.create({ ...parsed, description: parsed.description ?? null })
  }

  update(id: string, dto: UpdateProductDTO): Product {
    if (dto.barcode) {
      const existing = this.repo.getByBarcode(dto.barcode)
      if (existing && existing.id !== id) {
        throw new Error('Another product already uses this barcode')
      }
    }
    return this.repo.update(id, dto)
  }

  remove(id: string): void {
    this.repo.remove(id)
  }

  categories(): string[] {
    return this.repo.categories()
  }
}
