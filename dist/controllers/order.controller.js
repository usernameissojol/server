"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCourier = exports.handleBatchActions = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.deleteOrder = exports.getOrderStats = exports.getOrders = void 0;
const prisma_1 = require("../lib/prisma");
const getOrders = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        // Fetch orders checking for items (Manual join pattern)
        const orders = await prisma_1.prisma.orders.findMany({
            take: limit,
            orderBy: { created_at: 'desc' },
            include: { order_items: true }
        });
        // Extract product IDs
        const productIds = Array.from(new Set(orders.flatMap(o => o.order_items.map((i) => i.product_id))));
        // Fetch product images
        const products = await prisma_1.prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, image: true }
        });
        // Map product images
        const productMap = products.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.image }), {});
        // Attach image to orders
        const ordersWithImage = orders.map(order => {
            const firstItem = order.order_items && order.order_items.length > 0 ? order.order_items[0] : null;
            const image = firstItem ? productMap[firstItem.product_id] : null;
            return { ...order, product_image: image };
        });
        res.json(ordersWithImage);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching orders", error: error.message });
    }
};
exports.getOrders = getOrders;
const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await prisma_1.prisma.orders.count();
        const pendingOrders = await prisma_1.prisma.orders.count({
            where: {
                status: {
                    contains: 'pending'
                }
            }
        });
        res.json({ totalOrders, pendingOrders });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching order stats", error: error.message });
    }
};
exports.getOrderStats = getOrderStats;
const deleteOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ status: "error", message: "Invalid order ID" });
        }
        // Check if order exists
        const order = await prisma_1.prisma.orders.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }
        // Delete the order
        await prisma_1.prisma.orders.delete({
            where: { id: orderId }
        });
        res.json({ status: "success", message: "Order deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error deleting order", error: error.message });
    }
};
exports.deleteOrder = deleteOrder;
const getOrderById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const order = await prisma_1.prisma.orders.findUnique({
            where: { id },
            include: { order_items: true }
        });
        if (!order)
            return res.status(404).json({ status: "error", message: "Order not found" });
        // Map product images for items
        const productIds = order.order_items.map(item => item.product_id);
        const products = await prisma_1.prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, image: true, name: true }
        });
        const productMap = products.reduce((acc, curr) => ({
            ...acc,
            [curr.id]: { image: curr.image, name: curr.name }
        }), {});
        const orderWithImages = {
            ...order,
            items: order.order_items.map(item => ({
                ...item,
                product_image: productMap[item.product_id]?.image || null,
                product_name: productMap[item.product_id]?.name || null
            }))
        };
        res.json(orderWithImages);
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error fetching order", error: error.message });
    }
};
exports.getOrderById = getOrderById;
const createOrder = async (req, res) => {
    try {
        const data = req.body;
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.orders.create({
                data: {
                    user_id: data.user_id,
                    guest_name: data.guest_name,
                    guest_phone: data.guest_phone,
                    address: data.address,
                    subtotal: data.subtotal,
                    delivery_fee: data.delivery_fee || 0,
                    discount_amount: data.discount_amount || 0,
                    total: data.total,
                    p_method: data.p_method || 'COD',
                    p_status: data.p_status || 'unpaid',
                    status: data.status || 'Pending',
                    note: data.note
                }
            });
            if (data.items && Array.isArray(data.items)) {
                await tx.order_items.createMany({
                    data: data.items.map((item) => ({
                        order_id: order.id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            }
            return order;
        });
        res.json({ status: "success", message: "Order created successfully", order_id: result.id });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error creating order", error: error.message });
    }
};
exports.createOrder = createOrder;
const updateOrder = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        await prisma_1.prisma.orders.update({
            where: { id },
            data: {
                status: data.status,
                p_status: data.p_status,
                address: data.address,
                courier_name: data.courier_name,
                tracking_code: data.tracking_code,
                note: data.note
            }
        });
        res.json({ status: "success", message: "Order updated successfully" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error updating order", error: error.message });
    }
};
exports.updateOrder = updateOrder;
const handleBatchActions = async (req, res) => {
    try {
        const { ids, action, status } = req.body;
        if (!Array.isArray(ids))
            return res.status(400).json({ status: "error", message: "Invalid IDs" });
        const orderIds = ids.map(id => parseInt(id.toString()));
        if (action === 'delete') {
            await prisma_1.prisma.orders.deleteMany({
                where: { id: { in: orderIds } }
            });
            return res.json({ status: "success", message: "Orders deleted successfully" });
        }
        else if (action === 'status_update' && status) {
            await prisma_1.prisma.orders.updateMany({
                where: { id: { in: orderIds } },
                data: { status }
            });
            return res.json({ status: "success", message: "Orders updated successfully" });
        }
        res.status(400).json({ status: "error", message: "Invalid action" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error performing batch action", error: error.message });
    }
};
exports.handleBatchActions = handleBatchActions;
const assignCourier = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { provider, logo } = req.body;
        if (!provider) {
            return res.status(400).json({ status: "error", message: "Courier provider is required" });
        }
        // Simulating external courier API call here
        const trackingCode = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await prisma_1.prisma.orders.update({
            where: { id },
            data: {
                courier_name: provider,
                courier_logo: logo,
                tracking_code: trackingCode,
                status: 'Shipped' // Automatically update status to Shipped
            }
        });
        res.json({
            status: "success",
            message: `Order assigned to ${provider} successfully`,
            tracking_code: trackingCode
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "Error assigning courier", error: error.message });
    }
};
exports.assignCourier = assignCourier;
