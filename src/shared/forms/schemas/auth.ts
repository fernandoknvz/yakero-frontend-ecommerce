import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Ingresa tu email.' })
    .trim()
    .min(1, 'Ingresa tu email.')
    .pipe(z.email('Ingresa un email valido.')),
  password: z.string({ error: 'Ingresa tu contrasena.' }).trim().min(1, 'Ingresa tu contrasena.'),
});

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, 'El nombre es obligatorio.'),
    last_name: z.string().trim().min(1, 'El apellido es obligatorio.'),
    email: z.email('Ingresa un email valido.'),
    phone: z.string().trim().optional(),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres.'),
    confirm: z.string().min(1, 'Confirma tu contrasena.'),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    message: 'Las contrasenas no coinciden.',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
