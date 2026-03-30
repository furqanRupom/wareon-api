// src/seeders/seed.category.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Category } from '../category/schemas/category.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from '../category/dto/create-category.dto';

const categoriesData = [
    {
        name: "Electronics",
        slug: "electronics",
        status: "ACTIVE"
    },
    {
        name: "Clothing",
        slug: "clothing",
      
        status: "ACTIVE"
    },
    {
        name: "Shoes",
        slug: "shoes",
  
        status: "ACTIVE"
    },
    {
        name: "Furniture",
        slug: "furniture",
     
        status: "ACTIVE"
    },
    {
        name: "Miscellaneous",
        slug: "miscellaneous",
    
        status: "ACTIVE"
    },
    {
        name: "Books",
        slug: "books",
  
        status: "ACTIVE"
    },
    {
        name: "Sports & Outdoors",
        slug: "sports-outdoors",
   
        status: "ACTIVE"
    },
    {
        name: "Beauty & Personal Care",
        slug: "beauty-personal-care",

        status: "ACTIVE"
    },
    {
        name: "Home & Kitchen",
        slug: "home-kitchen",
   
        status: "ACTIVE"
    },
    {
        name: "Toys & Games",
        slug: "toys-games",
    
        status: "ACTIVE"
    },
    {
        name: "Automotive",
        slug: "automotive",
 
        status: "ACTIVE"
    },
    {
        name: "Jewelry & Accessories",
        slug: "jewelry-accessories",
    
        status: "ACTIVE"
    },
    {
        name: "Health & Wellness",
        slug: "health-wellness",
   
        status: "ACTIVE"
    },
    {
        name: "Pet Supplies",
        slug: "pet-supplies",
    
        status: "ACTIVE"
    },
    {
        name: "Baby Products",
        slug: "baby-products",
        status: "ACTIVE"
    }
];

async function seedCategories() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const categoryModel = app.get<Model<Category>>(getModelToken(Category.name));

        console.log('🌱 Starting category seeding...');

        // Clear existing categories (optional - remove if you want to keep existing)
        // await categoryModel.deleteMany({});
        // console.log('✓ Cleared existing categories');

        // Insert new categories
        const createdCategories = await categoryModel.insertMany(categoriesData);

        console.log(`✅ Successfully seeded ${createdCategories.length} categories`);
        console.log('Categories seeded:');
        createdCategories.forEach(cat => {
            console.log(`  - ${cat.name} (${cat.slug})`);
        });

    } catch (error) {
        console.error('❌ Error seeding categories:', error.message);
        throw error;
    } finally {
        await app.close();
    }
}

seedCategories();