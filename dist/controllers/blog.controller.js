"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogById = exports.getBlogs = exports.getBlogCategories = exports.getBlogStats = void 0;
const prisma_1 = require("../lib/prisma");
// Stats
const getBlogStats = async (req, res) => {
    try {
        const totalPosts = await prisma_1.prisma.blogs.count();
        const publishedPosts = await prisma_1.prisma.blogs.count({ where: { status: 'published' } });
        const draftPosts = await prisma_1.prisma.blogs.count({ where: { status: 'draft' } });
        // Count total views
        const viewsResult = await prisma_1.prisma.blogs.aggregate({
            _sum: { views: true }
        });
        const totalViews = viewsResult._sum.views || 0;
        res.json({
            status: "success",
            data: {
                total_posts: totalPosts,
                published_posts: publishedPosts,
                draft_posts: draftPosts,
                total_views: totalViews
            }
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching blog stats", error: error.message });
    }
};
exports.getBlogStats = getBlogStats;
// Categories (since schema has blog_categories model, use it, or fallback to distinct)
const getBlogCategories = async (req, res) => {
    try {
        // Option 1: Use blog_categories table if populated
        let categories = await prisma_1.prisma.blog_categories.findMany();
        // Option 2: If empty, maybe distinct from blogs table? 
        // For now, let's just return what we have. 
        // If the user wants to manage categories, we might need a separate controller, 
        // but for now this endpoint is just for listing used categories or available ones.
        if (categories.length === 0) {
            const distinctBlogs = await prisma_1.prisma.blogs.groupBy({
                by: ['category'],
            });
            categories = distinctBlogs
                .filter(b => b.category)
                .map((b, i) => ({ id: i + 1, name: b.category, slug: (b.category || '').toLowerCase().replace(/ /g, '-') }));
        }
        res.json({
            status: "success",
            data: categories
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching blog categories", error: error.message });
    }
};
exports.getBlogCategories = getBlogCategories;
const getBlogs = async (req, res) => {
    try {
        const { status, category } = req.query;
        const where = {};
        if (status && status !== 'all')
            where.status = status;
        if (category)
            where.category = category;
        const blogs = await prisma_1.prisma.blogs.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
        res.json({
            status: "success",
            data: blogs
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching blogs", error: error.message });
    }
};
exports.getBlogs = getBlogs;
const getBlogById = async (req, res) => {
    try {
        const id = req.params.id;
        const blog = await prisma_1.prisma.blogs.findUnique({
            where: { id: parseInt(id) }
        });
        if (!blog)
            return res.status(404).json({ status: "error", message: "Blog not found" });
        res.json({
            status: "success",
            data: blog
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching blog", error: error.message });
    }
};
exports.getBlogById = getBlogById;
const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
};
const createBlog = async (req, res) => {
    try {
        const data = req.body;
        // Basic slug generation
        let slug = data.slug;
        if (!slug && data.title) {
            slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        const featuredImage = data.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070";
        const readTime = calculateReadTime(data.content || "");
        const newBlog = await prisma_1.prisma.blogs.create({
            data: {
                title: data.title,
                slug: slug || `blog-${Date.now()}`,
                excerpt: data.excerpt,
                content: data.content,
                featured_image: featuredImage,
                category: data.category || "General",
                author: data.author || "Admin",
                status: data.status || "draft",
                read_time: readTime,
                is_featured: data.is_featured === 1 || data.is_featured === true,
                meta_title: data.meta_title || data.title,
                meta_description: data.meta_description || data.excerpt,
                meta_keywords: data.meta_keywords,
                views: 0
            }
        });
        res.json({
            status: "success",
            data: newBlog
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating blog", error: error.message });
    }
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const readTime = calculateReadTime(data.content || "");
        const updatedBlog = await prisma_1.prisma.blogs.update({
            where: { id: parseInt(id) },
            data: {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                featured_image: data.featured_image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070",
                category: data.category,
                author: data.author,
                status: data.status,
                read_time: readTime,
                is_featured: data.is_featured === 1 || data.is_featured === true,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
                meta_keywords: data.meta_keywords,
                updated_at: new Date()
            }
        });
        res.json({
            status: "success",
            data: updatedBlog
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating blog", error: error.message });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.blogs.delete({
            where: { id: parseInt(id) }
        });
        res.json({ status: "success", message: "Blog deleted" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting blog", error: error.message });
    }
};
exports.deleteBlog = deleteBlog;
