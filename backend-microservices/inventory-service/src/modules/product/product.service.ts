import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../../models/product.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Op, Sequelize } from 'sequelize';
import { ProductCategory } from '../../models/product-category.model';
import { Inventory } from '../../models/inventory.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
    @InjectModel(Inventory)
    private readonly inventoryModel: typeof Inventory,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = await this.productModel.create({
      ...createProductDto
    });

    // Create initial inventory record if not exists
    await this.inventoryModel.findOrCreate({
      where: { productId: product.id },
      defaults: {
        productId: product.id,
        quantity: 0,
        lowStockThreshold: 5,
        isAvailable: true,
        reservedQuantity: 0
      }
    });

    return this.findOne(product.id);
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.findAll({
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findActive(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { status: 'ACTIVE' },
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findFeatured(): Promise<Product[]> {
    return this.productModel.findAll({
      where: { 
        isFeatured: true,
        status: 'ACTIVE'
      },
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findByPk(id, {
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ]
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    await product.update(updateProductDto);
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await product.destroy();
  }

  async search(query: string): Promise<Product[]> {
    return this.productModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { shortDescription: { [Op.iLike]: `%${query}%` } },
          { sku: { [Op.iLike]: `%${query}%` } },
          { barcode: { [Op.iLike]: `%${query}%` } },
          { brand: { [Op.iLike]: `%${query}%` } },
          Sequelize.where(
            Sequelize.fn('ARRAY_TO_STRING', Sequelize.col('tags'), ','),
            Op.iLike,
            `%${query}%`
          )
        ]
      },
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productModel.findAll({
      where: { categoryId },
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findByVendor(vendorId: string): Promise<Product[]> {
    return this.productModel.findAll({
      where: { vendorId },
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findLowStock(): Promise<Product[]> {
    return this.productModel.findAll({
      include: [
        { model: ProductCategory, as: 'category' },
        { 
          model: Inventory, 
          as: 'inventory',
          where: Sequelize.literal('"inventory"."quantity" <= "inventory"."lowStockThreshold"')
        }
      ],
      order: [['name', 'ASC']]
    });
  }

  async findByPetType(petType: string): Promise<Product[]> {
    return this.productModel.findAll({
      where: Sequelize.literal(`'${petType}' = ANY("petTypes")`),
      include: [
        { model: ProductCategory, as: 'category' },
        { model: Inventory, as: 'inventory' }
      ],
      order: [['name', 'ASC']]
    });
  }
}
