import { getSupabase, isSupabaseEnabled } from "./client";
import { dbGetPendingOrders, dbUpdateSyncStatus } from "@/lib/db";
import type { Order } from "@/lib/types";

export async function syncOrder(order: Order): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("orders").upsert({
      id: order.id,
      bill_number: order.billNumber,
      items: order.items,
      subtotal_paise: order.subtotalPaise,
      discount_paise: order.discountPaise,
      gst_paise: order.gstPaise,
      total_paise: order.totalPaise,
      payment_method: order.paymentMethod,
      created_at: order.createdAt,
    });
    if (error) throw error;
    await dbUpdateSyncStatus(order.id, "synced");
    return true;
  } catch {
    await dbUpdateSyncStatus(order.id, "failed");
    return false;
  }
}

export async function backgroundSync(): Promise<void> {
  if (!isSupabaseEnabled()) return;
  try {
    const pending = await dbGetPendingOrders();
    for (const order of pending) {
      await syncOrder(order);
    }
  } catch {
    // silently fail — sync is optional
  }
}
