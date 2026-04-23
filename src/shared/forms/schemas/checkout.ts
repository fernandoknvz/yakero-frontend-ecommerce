import { z } from 'zod';

export function createCheckoutContactSchema(isAuthenticated: boolean) {
  return z.object({
    guestEmail: isAuthenticated
      ? z.string().optional()
      : z.email('Ingresa un email valido para confirmar el pedido.'),
    guestPhone: z.string().trim().optional(),
    notes: z.string().max(240, 'Las notas deben tener menos de 240 caracteres.'),
    couponInput: z.string().trim().max(30, 'El cupon es demasiado largo.'),
  });
}

export type CheckoutFormValues = z.infer<ReturnType<typeof createCheckoutContactSchema>>;
