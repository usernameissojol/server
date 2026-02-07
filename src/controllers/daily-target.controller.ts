import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { startOfDay, endOfDay, eachHourOfInterval, format } from "date-fns";

export const getDailyTargetStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const start = startOfDay(today);
        const end = endOfDay(today);

        // Fetch target for today
        const targetFromDb = await prisma.daily_targets.findFirst({
            where: {
                target_date: start
            }
        });

        // If no target exists, use defaults
        const target = targetFromDb || {
            id: 0,
            target_date: start,
            revenue_target: 10000,
            orders_target: 20,
            visits_target: 500,
            conversion_target: 2.5,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Fetch current stats
        const orders = await prisma.orders.findMany({
            where: {
                created_at: {
                    gte: start,
                    lte: end
                },
                status: {
                    not: 'Cancelled'
                }
            },
            select: {
                total: true,
                created_at: true
            }
        });

        const currentSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const currentOrders = orders.length;

        // Mock visits for now as we don't have a visits table
        const currentVisits = Math.floor(currentOrders * (100 / Number(target?.conversion_target || 2.5))) || 0;
        const currentConversion = currentVisits > 0 ? (currentOrders / currentVisits) * 100 : 0;

        // Hourly breakdown
        const hours = eachHourOfInterval({
            start: startOfDay(today),
            end: endOfDay(today)
        }).slice(0, 24); // Ensure only 24 hours

        // For visualization, we might only show a subset (e.g. 6 slots as per frontend mapping)
        // But let's provide 12 slots for better resolution
        const hourlyStats = hours.map((hour: Date, index: number) => {
            const hourStart = hour;
            const hourEnd = new Date(hour.getTime() + 60 * 60 * 1000);

            const hourOrders = orders.filter(o => {
                const orderTime = new Date(o.created_at);
                return orderTime >= hourStart && orderTime < hourEnd;
            });

            const hourSales = hourOrders.reduce((sum, o) => sum + Number(o.total), 0);
            const paceTarget = Number(target?.revenue_target || 10000) / 24;

            return {
                time: format(hour, "ha"),
                sales: hourSales,
                target: paceTarget
            };
        });

        // The frontend seems to expect about 12 or 6 slots based on its grid. 
        // AdminDailyTarget.tsx line 386 uses grid-cols-6 md:grid-cols-12.
        // So 12 slots is perfect. We can group by 2 hours or just take every 2nd hour.
        const sampledHourly = hourlyStats.filter((_: any, i: number) => i % 2 === 0);

        res.json({
            stats: {
                sales: { current: currentSales, target: Number(target.revenue_target), label: "Revenue" },
                orders: { current: currentOrders, target: target.orders_target, label: "Orders" },
                visits: { current: currentVisits, target: target.visits_target, label: "Visits" },
                conversion: { current: Number(currentConversion.toFixed(2)), target: Number(target.conversion_target), label: "Conversion" }
            },
            hourly: sampledHourly
        });

    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error fetching daily targets", error: error.message });
    }
};

export const updateDailyTargets = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const today = startOfDay(new Date());

        const existing = await prisma.daily_targets.findFirst({
            where: { target_date: today }
        });

        if (existing) {
            await prisma.daily_targets.update({
                where: { id: existing.id },
                data: {
                    revenue_target: data.revenue_target,
                    orders_target: data.orders_target,
                    visits_target: data.visits_target,
                    conversion_target: data.conversion_target,
                    updated_at: new Date()
                }
            });
        } else {
            await prisma.daily_targets.create({
                data: {
                    target_date: today,
                    revenue_target: data.revenue_target,
                    orders_target: data.orders_target,
                    visits_target: data.visits_target,
                    conversion_target: data.conversion_target
                }
            });
        }

        res.json({ status: "success", message: "Targets updated successfully" });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: "Error updating targets", error: error.message });
    }
};
