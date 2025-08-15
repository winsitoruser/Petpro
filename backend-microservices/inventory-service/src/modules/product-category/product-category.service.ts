import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductCategory } from '../../models/product-category.model';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { Op } from 'sequelize';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(ProductCategory)
    private readonly productCategoryModel: typeof ProductCategory,
  ) {}

  async create(createProductCategoryDto: CreateProductCategoryDto): Promise<ProductCategory> {
    return this.productCategoryModel.create({
      ...createProductCategoryDto
    });
  }

  async findAll(): Promise<ProductCategory[]> {
    return this.productCategoryModel.findAll({
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async findActive(): Promise<ProductCategory[]> {
    return this.productCategoryModel.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async findOne(id: string): Promise<ProductCategory> {
    const category = await this.productCategoryModel.findByPk(id);
    
    if (!category) {
      throw new NotFoundException(`Product category with ID ${id} not found`);
    }
    
    return category;
  }

  async update(id: string, updateProductCategoryDto: UpdateProductCategoryDto): Promise<ProductCategory> {
    const category = await this.findOne(id);
    
    await category.update(updateProductCategoryDto);
    
    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await category.destroy();
  }

  async search(query: string): Promise<ProductCategory[]> {
    return this.productCategoryModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async findByParentId(parentId: string): Promise<ProductCategory[]> {
    return this.productCategoryModel.findAll({
      where: { parentCategoryId: parentId },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  async findRootCategories(): Promise<ProductCategory[]> {
    return this.productCategoryModel.findAll({
      where: { parentCategoryId: null },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }
}
