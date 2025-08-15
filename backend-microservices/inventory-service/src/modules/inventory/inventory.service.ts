import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inventory } from '../../models/inventory.model';
import { Product } from '../../models/product.model';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory)
    private readonly inventoryModel: typeof Inventory,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // Check if product exists
    const product = await this.productModel.findByPk(createInventoryDto.productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${createInventoryDto.productId} not found`);
    }

    // Check if inventory for this product already exists
    const existingInventory = await this.inventoryModel.findOne({
      where: { productId: createInventoryDto.productId }
    });
    
    if (existingInventory) {
      throw new Error(`Inventory for product ID ${createInventoryDto.productId} already exists`);
    }

    return this.inventoryModel.create({
      ...createInventoryDto
    });
  }

  async findAll(): Promise<Inventory[]> {
    return this.inventoryModel.findAll({
      include: [{ model: Product, as: 'product' }]
    });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryModel.findByPk(id, {
      include: [{ model: Product, as: 'product' }]
    });
    
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    
    return inventory;
  }

  async findByProductId(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryModel.findOne({
      where: { productId },
      include: [{ model: Product, as: 'product' }]
    });
    
    if (!inventory) {
      throw new NotFoundException(`Inventory for product ID ${productId} not found`);
    }
    
    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    
    // If updating productId, check if new product exists
    if (updateInventoryDto.productId && updateInventoryDto.productId !== inventory.productId) {
      const product = await this.productModel.findByPk(updateInventoryDto.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${updateInventoryDto.productId} not found`);
      }
      
      // Check if inventory for this new product already exists
      const existingInventory = await this.inventoryModel.findOne({
        where: { productId: updateInventoryDto.productId }
      });
      
      if (existingInventory && existingInventory.id !== id) {
        throw new Error(`Inventory for product ID ${updateInventoryDto.productId} already exists`);
      }
    }
    
    await inventory.update(updateInventoryDto);
    
    return this.findOne(id);
  }

  async updateByProductId(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.inventoryModel.findOne({ where: { productId } });
    
    if (!inventory) {
      throw new NotFoundException(`Inventory for product ID ${productId} not found`);
    }
    
    await inventory.update(updateInventoryDto);
    
    return this.findByProductId(productId);
  }

  async adjustQuantity(id: string, quantityChange: number): Promise<Inventory> {
    const inventory = await this.findOne(id);
    
    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Cannot reduce inventory below zero');
    }
    
    await inventory.update({ quantity: newQuantity });
    
    return this.findOne(id);
  }

  async adjustQuantityByProductId(productId: string, quantityChange: number): Promise<Inventory> {
    const inventory = await this.findByProductId(productId);
    
    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Cannot reduce inventory below zero');
    }
    
    await inventory.update({ quantity: newQuantity });
    
    return this.findByProductId(productId);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.findOne(id);
    await inventory.destroy();
  }

  async findLowStock(): Promise<Inventory[]> {
    return this.inventoryModel.findAll({
      where: {
        [Symbol.for('sequelize.Op.where')]: this.inventoryModel.sequelize.literal('"quantity" <= "lowStockThreshold"')
      },
      include: [{ model: Product, as: 'product' }]
    });
  }

  async findOutOfStock(): Promise<Inventory[]> {
    return this.inventoryModel.findAll({
      where: { quantity: 0 },
      include: [{ model: Product, as: 'product' }]
    });
  }
}
