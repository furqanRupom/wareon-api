// src/seeders/product.seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Product } from '../product/schemas/product.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Product data with actual category IDs from your database
const productsData = [
    {
        name: "Chic Transparent Fashion Handbag",
        price: 61,
        description: "Elevate your style with our Chic Transparent Fashion Handbag, perfect for showcasing your essentials with a clear, modern edge. This trendy accessory features durable acrylic construction, luxe gold-tone hardware, and an elegant chain strap.",
        categoryId: "69cad7bf49dbec148698d3fd", // Miscellaneous
        images: [
            "https://i.imgur.com/Lqaqz59.jpg",
            "https://i.imgur.com/uSqWK0m.jpg",
            "https://i.imgur.com/atWACf1.jpg"
        ],
        stock: 50,
        minStockThreshold: 10,
        sku: "CHIC-TRANSPARENT-001"
    },
    {
        name: "Sleek Futuristic Electric Bicycle",
        price: 22,
        description: "This modern electric bicycle combines style and efficiency with its unique design and top-notch performance features. Equipped with a durable frame, enhanced battery life, and integrated tech capabilities.",
        categoryId: "69cad7bf49dbec148698d3fd", // Miscellaneous
        images: [
            "https://i.imgur.com/BG8J0Fj.jpg",
            "https://i.imgur.com/ujHBpCX.jpg",
            "https://i.imgur.com/WHeVL9H.jpg"
        ],
        stock: 25,
        minStockThreshold: 5,
        sku: "SLEEK-BICYCLE-002"
    },
    {
        name: "Sleek Olive Green Hardshell Carry-On Luggage",
        price: 48,
        description: "Travel in style with our durable hardshell carry-on, perfect for weekend getaways and business trips. This sleek olive green suitcase features smooth gliding wheels and a sturdy telescopic handle.",
        categoryId: "69cad7bf49dbec148698d3fd", // Miscellaneous
        images: [
            "https://i.imgur.com/jVfoZnP.jpg",
            "https://i.imgur.com/Tnl15XK.jpg",
            "https://i.imgur.com/7OqTPO6.jpg"
        ],
        stock: 30,
        minStockThreshold: 8,
        sku: "OLIVE-LUGGAGE-003"
    },
    {
        name: "Radiant Citrus Eau de Parfum",
        price: 73,
        description: "Indulge in the essence of summer with this vibrant citrus-scented Eau de Parfum. Encased in a sleek glass bottle, this fragrance embodies freshness and elegance.",
        categoryId: "69cad7bf49dbec148698d3fd", // Miscellaneous
        images: [
            "https://i.imgur.com/xPDwUb3.jpg",
            "https://i.imgur.com/3rfp691.jpg",
            "https://i.imgur.com/kG05a29.jpg"
        ],
        stock: 100,
        minStockThreshold: 20,
        sku: "CITRUS-PARFUM-004"
    },
    {
        name: "Wireless Noise-Canceling Headphones",
        price: 199,
        description: "Premium wireless headphones with active noise cancellation and 30-hour battery life. Experience crystal clear audio with deep bass and comfortable over-ear design.",
        categoryId: "69cad7bf49dbec148698d3f9", // Electronics
        images: [
            "https://i.imgur.com/8Y5EwQk.jpg",
            "https://i.imgur.com/3rfp691.jpg"
        ],
        stock: 75,
        minStockThreshold: 15,
        sku: "WIRELESS-HP-005"
    },
    {
        name: "Smart Watch Pro",
        price: 299,
        description: "Advanced smartwatch with health tracking, GPS, heart rate monitor, and waterproof design. Compatible with iOS and Android devices.",
        categoryId: "69cad7bf49dbec148698d3f9", // Electronics
        images: [
            "https://i.imgur.com/ZN6cHrF.jpg"
        ],
        stock: 45,
        minStockThreshold: 10,
        sku: "SMART-WATCH-006"
    },
    {
        name: "Classic Denim Jacket",
        price: 89,
        description: "Timeless denim jacket perfect for any casual occasion. Made from 100% cotton with a comfortable fit and durable construction.",
        categoryId: "69cad7bf49dbec148698d3fa", // Clothing
        images: [
            "https://i.imgur.com/QkIa5tT.jpeg"
        ],
        stock: 120,
        minStockThreshold: 25,
        sku: "DENIM-JACKET-007"
    },
    {
        name: "Running Shoes - Professional",
        price: 120,
        description: "High-performance running shoes with advanced cushioning technology, breathable mesh upper, and durable rubber outsole for maximum traction.",
        categoryId: "69cad7bf49dbec148698d3fb", // Shoes
        images: [
            "https://i.imgur.com/qNOjJje.jpeg"
        ],
        stock: 85,
        minStockThreshold: 20,
        sku: "RUNNING-SHOES-008"
    },
    {
        name: "Modern Office Desk",
        price: 350,
        description: "Sleek modern desk with built-in cable management, spacious storage, and ergonomic design. Perfect for home office or professional workspace.",
        categoryId: "69cad7bf49dbec148698d3fc", // Furniture
        images: [
            "https://i.imgur.com/Qphac99.jpeg"
        ],
        stock: 15,
        minStockThreshold: 5,
        sku: "OFFICE-DESK-009"
    },
    {
        name: "Bestseller Novel Collection",
        price: 45,
        description: "Set of 5 bestselling novels from renowned authors. Perfect gift for book lovers and avid readers.",
        categoryId: "69cad7bf49dbec148698d3fe", // Books
        images: [
            "https://i.imgur.com/3XHqXq8.jpg"
        ],
        stock: 200,
        minStockThreshold: 40,
        sku: "NOVEL-SET-010"
    },
    {
        name: "Yoga Mat Premium",
        price: 35,
        description: "Eco-friendly non-slip yoga mat with carrying strap. 6mm thickness for optimal comfort and support during your practice.",
        categoryId: "69cad7bf49dbec148698d3ff", // Sports & Outdoors
        images: [
            "https://i.imgur.com/ZN6cHrF.jpg"
        ],
        stock: 150,
        minStockThreshold: 30,
        sku: "YOGA-MAT-011"
    },
    {
        name: "Skincare Kit - Complete Set",
        price: 85,
        description: "Complete skincare routine kit with cleanser, toner, moisturizer, and serum. Suitable for all skin types.",
        categoryId: "69cad7bf49dbec148698d400", // Beauty & Personal Care
        images: [
            "https://i.imgur.com/xPDwUb3.jpg"
        ],
        stock: 60,
        minStockThreshold: 12,
        sku: "SKINCARE-KIT-012"
    },
    {
        name: "Chef's Knife Set",
        price: 150,
        description: "Professional 5-piece knife set with wooden block. High-carbon stainless steel blades with ergonomic handles.",
        categoryId: "69cad7bf49dbec148698d401", // Home & Kitchen
        images: [
            "https://i.imgur.com/jVfoZnP.jpg"
        ],
        stock: 40,
        minStockThreshold: 8,
        sku: "CHEF-KNIFE-013"
    },
    {
        name: "Educational Building Blocks",
        price: 55,
        description: "500-piece building blocks set for creative learning. Develops motor skills and creativity in children.",
        categoryId: "69cad7bf49dbec148698d402", // Toys & Games
        images: [
            "https://i.imgur.com/Lqaqz59.jpg"
        ],
        stock: 180,
        minStockThreshold: 35,
        sku: "BUILDING-BLOCKS-014"
    },
    {
        name: "Car Phone Mount",
        price: 25,
        description: "Universal magnetic car phone mount with strong grip. Easy installation and 360-degree rotation for optimal viewing angle.",
        categoryId: "69cad7bf49dbec148698d403", // Automotive
        images: [
            "https://i.imgur.com/WHeVL9H.jpg"
        ],
        stock: 300,
        minStockThreshold: 60,
        sku: "CAR-MOUNT-015"
    },
    {
        name: "Silver Necklace Set",
        price: 95,
        description: "Elegant silver necklace with matching earrings set. Hypoallergenic and perfect for special occasions or everyday wear.",
        categoryId: "69cad7bf49dbec148698d404", // Jewelry & Accessories
        images: [
            "https://i.imgur.com/atWACf1.jpg"
        ],
        stock: 55,
        minStockThreshold: 10,
        sku: "NECKLACE-SET-016"
    },
    {
        name: "Adjustable Dumbbells",
        price: 199,
        description: "Space-saving adjustable dumbbells for home workouts. Quick adjustment mechanism with durable non-slip grip.",
        categoryId: "69cad7bf49dbec148698d405", // Health & Wellness
        images: [
            "https://i.imgur.com/3rfp691.jpg"
        ],
        stock: 35,
        minStockThreshold: 7,
        sku: "DUMBBELLS-017"
    },
    {
        name: "Pet Bed Deluxe",
        price: 65,
        description: "Luxurious orthopedic pet bed for maximum comfort. Removable, machine-washable cover with memory foam support.",
        categoryId: "69cad7bf49dbec148698d406", // Pet Supplies
        images: [
            "https://i.imgur.com/kG05a29.jpg"
        ],
        stock: 70,
        minStockThreshold: 14,
        sku: "PET-BED-018"
    },
    {
        name: "Baby Stroller",
        price: 280,
        description: "Lightweight and foldable baby stroller with safety features. Includes adjustable canopy, storage basket, and 5-point harness.",
        categoryId: "69cad7bf49dbec148698d407", // Baby Products
        images: [
            "https://i.imgur.com/Tnl15XK.jpg"
        ],
        stock: 20,
        minStockThreshold: 4,
        sku: "BABY-STROLLER-019"
    },
    {
        name: "Premium Laptop Backpack",
        price: 79,
        description: "Water-resistant laptop backpack with USB charging port, padded compartment for 15.6-inch laptops, and multiple storage pockets.",
        categoryId: "69cad7bf49dbec148698d3fa", // Clothing
        images: [
            "https://i.imgur.com/QkIa5tT.jpeg",
            "https://i.imgur.com/Lqaqz59.jpg"
        ],
        stock: 95,
        minStockThreshold: 18,
        sku: "LAPTOP-BACKPACK-020"
    },
    {
        name: "Smart Home Speaker",
        price: 129,
        description: "Voice-controlled smart speaker with premium sound quality. Built-in assistant for music, information, and home automation.",
        categoryId: "69cad7bf49dbec148698d3f9", // Electronics
        images: [
            "https://i.imgur.com/8Y5EwQk.jpg"
        ],
        stock: 65,
        minStockThreshold: 13,
        sku: "SMART-SPEAKER-021"
    },
    {
        name: "Gaming Mechanical Keyboard",
        price: 89,
        description: "RGB mechanical keyboard with customizable lighting, programmable keys, and durable construction for gaming enthusiasts.",
        categoryId: "69cad7bf49dbec148698d3f9", // Electronics
        images: [
            "https://i.imgur.com/ujHBpCX.jpg"
        ],
        stock: 110,
        minStockThreshold: 22,
        sku: "GAMING-KEYBOARD-022"
    },
    {
        name: "Winter Parka Jacket",
        price: 180,
        description: "Warm winter parka with faux fur hood, waterproof exterior, and insulated lining for extreme cold weather protection.",
        categoryId: "69cad7bf49dbec148698d3fa", // Clothing
        images: [
            "https://i.imgur.com/QkIa5tT.jpeg"
        ],
        stock: 45,
        minStockThreshold: 9,
        sku: "WINTER-PARKA-023"
    },
    {
        name: "Leather Oxford Shoes",
        price: 110,
        description: "Classic leather oxford shoes with premium leather upper, cushioned insole, and durable rubber sole for formal occasions.",
        categoryId: "69cad7bf49dbec148698d3fb", // Shoes
        images: [
            "https://i.imgur.com/qNOjJje.jpeg"
        ],
        stock: 60,
        minStockThreshold: 12,
        sku: "LEATHER-OXFORD-024"
    },
    {
        name: "Ergonomic Office Chair",
        price: 250,
        description: "Ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back for all-day comfort.",
        categoryId: "69cad7bf49dbec148698d3fc", // Furniture
        images: [
            "https://i.imgur.com/Qphac99.jpeg"
        ],
        stock: 25,
        minStockThreshold: 5,
        sku: "OFFICE-CHAIR-025"
    }
];

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const productModel = app.get<Model<Product>>(getModelToken(Product.name));

        console.log('🌱 Starting product seeding...');
        console.log(`📦 Preparing to seed ${productsData.length} products`);

        // Prepare products with proper ObjectId conversion
        const productsToCreate = productsData.map(product => ({
            name: product.name,
            category: new Types.ObjectId(product.categoryId),
            price: product.price,
            description: product.description,
            productUrl: product.images,
            stock: product.stock,
            minStockThreshold: product.minStockThreshold,
            sku: product.sku,
            status: "ACTIVE"
        }));

        // Clear existing products (optional - remove if you want to keep existing)
        const deletedCount = await productModel.deleteMany({});
        console.log(`✓ Cleared ${deletedCount.deletedCount} existing products`);

        // Insert new products
        const createdProducts = await productModel.insertMany(productsToCreate);

        console.log(`✅ Successfully seeded ${createdProducts.length} products`);
        console.log('\n📋 Products seeded:');
        createdProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name}`);
            console.log(`     SKU: ${product.sku}`);
            console.log(`     Price: $${product.price}`);
            console.log(`     Stock: ${product.stock}`);
            console.log(`     Category ID: ${product.category}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
        if (error.code === 11000) {
            console.error('⚠️ Duplicate key error. Some products may already exist with the same SKU.');
        }
        throw error;
    } finally {
        await app.close();
    }
}

seed();