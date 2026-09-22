import { z } from "zod";

export const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional(),
  courseId: z.string().min(1),
  originalPrice: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  couponCode: z.string().trim().optional(),
  trackingLinkCode: z.string().trim().optional(),
  orderNumber: z.string().trim().optional(),
  placedAt: z.coerce.date().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createRefundSchema = z.object({
  amount: z.coerce.number().positive(),
  reason: z.string().optional(),
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
