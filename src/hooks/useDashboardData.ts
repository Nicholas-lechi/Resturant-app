import { useMemo } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { categories } from "@/data/categories";
import { isToday, percentChange, roundMoney } from "@/lib/utils";

const DAY = 86_400_000;

export function useDashboardData() {
  const orders = useRestaurantStore((s) => s.orders);
  const products = useRestaurantStore((s) => s.products);

  return useMemo(() => {
    const now = Date.now();
    const paid = orders.filter((o) => o.paymentStatus === "paid");
    const inRange = (iso: string, from: number, to: number) => {
      const t = new Date(iso).getTime();
      return t >= now - from * DAY && t < now - to * DAY;
    };

    const last15 = paid.filter((o) => inRange(o.createdAt, 15, 0));
    const prev15 = paid.filter((o) => inRange(o.createdAt, 30, 15));
    const sum = (list: typeof paid) =>
      roundMoney(list.reduce((s, o) => s + o.total, 0));

    // const revenue = sum(paid);
    const todayOrders = orders.filter((o) => isToday(o.createdAt));
    const yesterdayOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      const y = new Date(now - DAY);
      return d.toDateString() === y.toDateString();
    });

    // Daily revenue for the chart
    const daily = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(now - (29 - i) * DAY);
      const key = date.toDateString();
      const dayOrders = paid.filter(
        (o) => new Date(o.createdAt).toDateString() === key,
      );
      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: sum(dayOrders),
        orders: dayOrders.length,
      };
    });
    const revenue = roundMoney(daily.reduce((s, d) => s + d.revenue, 0));
    const paidIn30 = daily.reduce((s, d) => s + d.orders, 0);
    // Sales by category (from order line items)
    const productCategory = new Map(products.map((p) => [p.id, p.category]));
    const byCategory = categories
      .map((c) => ({
        name: c.name,
        value: roundMoney(
          paid.reduce(
            (s, o) =>
              s +
              o.items
                .filter((i) => productCategory.get(i.productId) === c.id)
                .reduce((a, i) => a + i.price * i.quantity, 0),
            0,
          ),
        ),
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    const topProducts = [...products]
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    return {
      revenue,
      revenueChange: percentChange(sum(last15), sum(prev15)),
      totalOrders: orders.length,
      ordersChange: percentChange(last15.length, prev15.length),
      todayCount: todayOrders.length,
      todayRevenue: sum(todayOrders.filter((o) => o.paymentStatus === "paid")),
      todayChange: percentChange(todayOrders.length, yesterdayOrders.length),
      avgOrder: paidIn30 ? roundMoney(revenue / paidIn30) : 0,
      avgChange: percentChange(
        last15.length ? sum(last15) / last15.length : 0,
        prev15.length ? sum(prev15) / prev15.length : 0,
      ),
      pending: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      outForDelivery: orders.filter((o) => o.status === "out_for_delivery")
        .length,
      daily,
      byCategory,
      topProducts,
      recent: orders.slice(0, 7),
    };
  }, [orders, products]);
}
