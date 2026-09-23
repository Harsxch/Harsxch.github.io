"use server";

import { revalidatePath } from "next/cache";
import { markAllNotificationsRead } from "@/lib/data/notifications";

export async function markAllReadAction() {
  await markAllNotificationsRead();
  revalidatePath("/influencer/notifications");
}
