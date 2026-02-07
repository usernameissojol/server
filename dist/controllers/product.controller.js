"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProducts = exports.bulkUpdateProducts = exports.bulkDeleteProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../lib/prisma");
const safelyParseJSON = (data, fallback = []) => {
    if (!data)
        return fallback;
    if (typeof data !== 'string')
        return data;
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.error("JSON Parse Error:", e, "Data:", data);
        return fallback;
    }
};
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const products = await prisma_1.prisma.products.findMany({
            where: category ? {
                categories: {
                    slug: category
                }
            } : {},
            include: {
                categories: {
                    include: {
                        parent: true
                    }
                },
                brands: true,
                product_tags: {
                    include: {
                        tags: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        const parsedProducts = products.map((p) => {
            const images = safelyParseJSON(p.images);
            const specs = safelyParseJSON(p.specs, {});
            const highlights = safelyParseJSON(p.highlights);
            const variants = safelyParseJSON(p.variants);
            // Handle Category Hierarchy
            let category_name = "Uncategorized";
            let sub_category_name = "-";
            if (p.categories) {
                if (p.categories.parent) {
                    category_name = p.categories.parent.name;
                    sub_category_name = p.categories.name;
                }
                else {
                    category_name = p.categories.name;
                    sub_category_name = "-";
                }
            }
            // Extract tags from product_tags or use highlights
            const tags = Array.isArray(p.product_tags) && p.product_tags.length > 0
                ? p.product_tags.map((pt) => pt.tags?.name).filter(Boolean)
                : (Array.isArray(highlights) ? highlights : []);
            return {
                ...p,
                images,
                specs,
                highlights,
                variants,
                category_name,
                sub_category_name,
                brand_name: p.brands?.name || "-",
                tags
            };
        });
        res.json(parsedProducts);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ status: "error", message: "Error fetching products", error: error.message });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma_1.prisma.products.findUnique({
            where: { id: parseInt(id) },
            include: {
                categories: {
                    include: {
                        parent: true
                    }
                },
                brands: true,
                product_tags: {
                    include: {
                        tags: true
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }
        const p = product;
        const images = safelyParseJSON(p.images);
        const specs = safelyParseJSON(p.specs, {});
        const highlights = safelyParseJSON(p.highlights);
        const variants = safelyParseJSON(p.variants);
        // Flatten relations
        let category_name = "Uncategorized";
        let sub_category_name = "-";
        if (p.categories) {
            if (p.categories.parent) {
                category_name = p.categories.parent.name;
                sub_category_name = p.categories.name;
            }
            else {
                category_name = p.categories.name;
                sub_category_name = "-";
            }
        }
        const brand_name = p.brands?.name || "-";
        const tags = p.product_tags?.map((pt) => pt.tags?.name).filter(Boolean) || [];
        res.json({
            ...p,
            images,
            specs,
            highlights,
            variants,
            category_name,
            brand_name,
            tags
        });
    }
    catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ status: "error", message: "Error fetching product", error: error.message });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const data = req.body;
        // Basic validation
        if (!data.name || data.price === undefined || data.price === null) {
            return res.status(400).json({ status: "error", message: "Name and Price are required" });
        }
        // Formatting data for Prisma
        const dbData = {
            name: data.name.toString(),
            slug: data.slug || data.name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            price: parseFloat(data.price.toString()),
            original_price: data.original_price ? parseFloat(data.original_price.toString()) : null,
            cost_price: data.cost_price ? parseFloat(data.cost_price.toString()) : null,
            discount: data.discount ? parseInt(data.discount.toString()) : 0,
            stock: data.stock !== undefined ? parseInt(data.stock.toString()) : 0,
            category_id: (data.category_id && !isNaN(parseInt(data.category_id))) ? parseInt(data.category_id) : null,
            brand_id: (data.brand_id && !isNaN(parseInt(data.brand_id))) ? parseInt(data.brand_id) : null,
            status: data.status || 'active',
            sku: data.sku || null,
            model: data.model || null,
            weight: data.weight || null,
            weight_unit: data.weight_unit || 'Kg',
            image: data.image || null,
            images: typeof data.images === 'object' ? JSON.stringify(data.images) : (typeof data.images === 'string' ? data.images : null),
            description: data.description || null,
            short_description: data.short_description || null,
            highlights: typeof data.highlights === 'object' ? JSON.stringify(data.highlights) : (typeof data.highlights === 'string' ? data.highlights : null),
            specs: typeof data.specs === 'object' ? JSON.stringify(data.specs) : (typeof data.specs === 'string' ? data.specs : null),
            variants: typeof data.variants === 'object' ? JSON.stringify(data.variants) : (typeof data.variants === 'string' ? data.variants : null),
            reward_points: data.reward_points ? parseInt(data.reward_points.toString()) : 0,
            is_new: data.is_new === true || data.is_new === 'true' || data.is_new === 1,
            is_popular: data.is_popular === true || data.is_popular === 'true' || data.is_popular === 1,
            is_wholesale: data.is_wholesale === true || data.is_wholesale === 'true' || data.is_wholesale === 1,
        };
        // Safety check for NaN on numeric fields
        ['price', 'original_price', 'cost_price', 'discount', 'stock', 'reward_points'].forEach(field => {
            if (dbData[field] !== null && isNaN(dbData[field])) {
                dbData[field] = 0;
            }
        });
        // Handle Tags (Relational)
        let tags = data.tags;
        if (typeof tags === 'string') {
            try {
                tags = JSON.parse(tags);
            }
            catch (e) {
                console.error("Failed to parse tags", e);
                tags = [];
            }
        }
        if (tags && Array.isArray(tags) && tags.length > 0) {
            dbData.product_tags = {
                create: tags.map((tagId) => ({
                    tag_id: parseInt(tagId.toString())
                }))
            };
        }
        console.log("Creating product with data:", JSON.stringify(dbData, null, 2));
        const product = await prisma_1.prisma.products.create({
            data: dbData
        });
        res.status(201).json({ status: "success", message: "Product created", product });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({
            status: "error",
            message: "Error creating product",
            error: error.message,
            stack: error.stack,
            details: error
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const data = req.body;
        const productId = parseInt(id);
        if (isNaN(productId)) {
            return res.status(400).json({ status: "error", message: "Invalid product ID" });
        }
        const dbData = {
            ...data,
            price: data.price !== undefined ? parseFloat(data.price.toString()) : undefined,
            original_price: data.original_price !== undefined ? (data.original_price && data.original_price !== 'null' ? parseFloat(data.original_price.toString()) : null) : undefined,
            cost_price: data.cost_price !== undefined ? (data.cost_price && data.cost_price !== 'null' ? parseFloat(data.cost_price.toString()) : null) : undefined,
            discount: data.discount !== undefined ? (data.discount && data.discount !== 'null' ? parseInt(data.discount.toString()) : 0) : undefined,
            stock: data.stock !== undefined ? parseInt(data.stock.toString()) : undefined,
            category_id: data.category_id !== undefined ? (data.category_id && !isNaN(parseInt(data.category_id)) ? parseInt(data.category_id) : null) : undefined,
            brand_id: data.brand_id !== undefined ? (data.brand_id && !isNaN(parseInt(data.brand_id)) ? parseInt(data.brand_id) : null) : undefined,
            images: typeof data.images === 'object' ? JSON.stringify(data.images) : (typeof data.images === 'string' ? data.images : undefined),
            highlights: typeof data.highlights === 'object' ? JSON.stringify(data.highlights) : (typeof data.highlights === 'string' ? data.highlights : undefined),
            specs: typeof data.specs === 'object' ? JSON.stringify(data.specs) : (typeof data.specs === 'string' ? data.specs : undefined),
            variants: typeof data.variants === 'object' ? JSON.stringify(data.variants) : (typeof data.variants === 'string' ? data.variants : undefined),
            reward_points: data.reward_points !== undefined ? parseInt(data.reward_points.toString()) : undefined,
            is_new: data.is_new !== undefined ? (data.is_new === true || data.is_new === 'true' || data.is_new === 1) : undefined,
            is_popular: data.is_popular !== undefined ? (data.is_popular === true || data.is_popular === 'true' || data.is_popular === 1) : undefined,
            is_wholesale: data.is_wholesale !== undefined ? (data.is_wholesale === true || data.is_wholesale === 'true' || data.is_wholesale === 1) : undefined,
        };
        // Handle Tags if provided
        if (data.tags && Array.isArray(data.tags)) {
            // Remove old tags
            await prisma_1.prisma.product_tags.deleteMany({
                where: { product_id: productId }
            });
            // Add new tags
            if (data.tags.length > 0) {
                await prisma_1.prisma.product_tags.createMany({
                    data: data.tags.map((tagId) => ({
                        product_id: productId,
                        tag_id: parseInt(tagId)
                    }))
                });
            }
        }
        // Remove tags from dbData as it's not a direct column
        delete dbData.tags;
        // Final sanitation check
        Object.keys(dbData).forEach(key => {
            if (dbData[key] === undefined)
                delete dbData[key];
        });
        const product = await prisma_1.prisma.products.update({
            where: { id: productId },
            data: dbData
        });
        res.json({ status: "success", message: "Product updated", product });
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ status: "error", message: "Error updating product", error: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.products.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Product deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting product", error: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: "error", message: "No product IDs provided" });
        }
        const productIds = ids.map(id => parseInt(id.toString()));
        const result = await prisma_1.prisma.products.deleteMany({
            where: {
                id: {
                    in: productIds
                }
            }
        });
        res.json({
            status: "success",
            message: `${result.count} product(s) deleted successfully`,
            deleted_count: result.count
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting products", error: error.message });
    }
};
exports.bulkDeleteProducts = bulkDeleteProducts;
const bulkUpdateProducts = async (req, res) => {
    try {
        const { ids, data } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ status: "error", message: "No product IDs provided" });
        }
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ status: "error", message: "No update data provided" });
        }
        const productIds = ids.map(id => parseInt(id.toString()));
        // Prepare update data
        const updateData = {};
        if (data.status)
            updateData.status = data.status;
        if (data.category_id)
            updateData.category_id = parseInt(data.category_id);
        if (data.brand_id)
            updateData.brand_id = parseInt(data.brand_id);
        if (data.discount !== undefined)
            updateData.discount = parseFloat(data.discount);
        if (data.stock !== undefined)
            updateData.stock = parseInt(data.stock);
        const result = await prisma_1.prisma.products.updateMany({
            where: {
                id: {
                    in: productIds
                }
            },
            data: updateData
        });
        // Handle Tags Update (Relational)
        if (data.tags && Array.isArray(data.tags)) {
            await prisma_1.prisma.$transaction(async (tx) => {
                for (const pid of productIds) {
                    // Remove existing tags
                    await tx.product_tags.deleteMany({ where: { product_id: pid } });
                    // Add new tags
                    if (data.tags.length > 0) {
                        await tx.product_tags.createMany({
                            data: data.tags.map((tagId) => ({
                                product_id: pid,
                                tag_id: parseInt(tagId)
                            }))
                        });
                    }
                }
            });
        }
        res.json({
            status: "success",
            message: `${result.count} product(s) updated successfully`,
            updated_count: result.count
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating products", error: error.message });
    }
};
exports.bulkUpdateProducts = bulkUpdateProducts;
const importProducts = async (req, res) => {
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ status: "error", message: "Invalid products data provided" });
        }
        const stats = {
            count: 0,
            errors: []
        };
        // Cache for categories and brands to avoid redundant DB queries
        const categoryCache = new Map();
        const brandCache = new Map();
        for (const p of products) {
            try {
                // 1. Data Mapping & Normalization
                const name = p.name || p.Name;
                const description = p.description || p.Description;
                const price = parseFloat((p.sales_price || p.price || p.Price || 0).toString());
                const originalPrice = (p.regular_price || p.original_price || p.OriginalPrice) ? parseFloat((p.regular_price || p.original_price || p.OriginalPrice).toString()) : null;
                const costPrice = p.cost_price ? parseFloat(p.cost_price.toString()) : null;
                const stock = parseInt((p.stock || p.Stock || 10).toString());
                const image = p.photos || p.image || p.Image || null;
                const categoryName = p.category || p.Category;
                const brandName = p.brand || p.Brand;
                const slug = p.slug || p.Slug;
                if (!name || isNaN(price)) {
                    stats.errors.push(`Product "${name || 'Unknown'}" skipped: Missing name or valid price`);
                    continue;
                }
                // 2. Resolve Category
                // 2. Resolve Category & Sub-Category
                let categoryId = p.category_id ? parseInt(p.category_id.toString()) : null;
                // If ID not provided, try to resolve by name
                if (!categoryId && categoryName) {
                    const cleanCat = categoryName.toString().trim();
                    const subCatName = p.sub_category || p.SubCategory;
                    let parentId = null;
                    // A. Check/Create Parent Category
                    if (categoryCache.has(cleanCat)) {
                        parentId = categoryCache.get(cleanCat);
                    }
                    else {
                        let category = await prisma_1.prisma.categories.findFirst({ where: { name: cleanCat, parent_id: null } });
                        if (!category) {
                            category = await prisma_1.prisma.categories.create({
                                data: {
                                    name: cleanCat,
                                    slug: cleanCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 5),
                                    parent_id: null
                                }
                            });
                        }
                        parentId = category.id;
                        categoryCache.set(cleanCat, parentId);
                    }
                    // B. Check/Create Sub-Category (if exists)
                    if (subCatName) {
                        const cleanSub = subCatName.toString().trim();
                        // Composite key for cache ideally, but for now simple check
                        let subCategory = await prisma_1.prisma.categories.findFirst({ where: { name: cleanSub, parent_id: parentId } });
                        if (!subCategory) {
                            subCategory = await prisma_1.prisma.categories.create({
                                data: {
                                    name: cleanSub,
                                    slug: cleanSub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 5),
                                    parent_id: parentId
                                }
                            });
                        }
                        categoryId = subCategory.id;
                    }
                    else {
                        categoryId = parentId;
                    }
                }
                // 3. Resolve Brand
                let brandId = p.brand_id ? parseInt(p.brand_id.toString()) : null;
                if (!brandId && brandName) {
                    const cleanBrand = brandName.toString().trim();
                    if (brandCache.has(cleanBrand)) {
                        brandId = brandCache.get(cleanBrand);
                    }
                    else {
                        let brand = await prisma_1.prisma.brands.findFirst({ where: { name: cleanBrand } });
                        if (!brand) {
                            brand = await prisma_1.prisma.brands.create({
                                data: { name: cleanBrand }
                            });
                        }
                        brandId = brand.id;
                        brandCache.set(cleanBrand, brandId);
                    }
                }
                // 4. Slug Generation
                const randomStr = Math.random().toString(36).substring(2, 5);
                const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + randomStr;
                // 5. Create Product
                await prisma_1.prisma.products.create({
                    data: {
                        name: name.toString(),
                        slug: finalSlug,
                        price: price,
                        original_price: originalPrice,
                        cost_price: costPrice,
                        discount: p.discount ? parseInt(p.discount.toString()) : 0,
                        stock: stock,
                        category_id: categoryId,
                        brand_id: brandId,
                        status: 'active',
                        sku: p.sku ? p.sku.toString() : null,
                        model: p.model ? p.model.toString() : null,
                        image: image,
                        description: description ? description.toString() : null,
                        short_description: p.short_description || null,
                        reward_points: p.reward_points ? parseInt(p.reward_points.toString()) : 0,
                    }
                });
                stats.count++;
            }
            catch (err) {
                console.error(`Import error for product ${p.name}:`, err);
                stats.errors.push(`Failed to import "${p.name || 'Unknown'}": ${err.message}`);
            }
        }
        res.json({
            status: "success",
            message: `Import completed: ${stats.count} products imported, ${stats.errors.length} errors`,
            success_count: stats.count,
            errors: stats.errors
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error importing products", error: error.message });
    }
};
exports.importProducts = importProducts;
