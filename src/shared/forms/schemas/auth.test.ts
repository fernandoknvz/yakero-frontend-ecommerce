import { describe, expect, it } from 'vitest';

import { loginSchema } from './auth';

describe('loginSchema', () => {
  it('accepts the admin login credentials shape', () => {
    const result = loginSchema.safeParse({
      email: 'feradmin@example.com',
      password: 'Admin123456',
    });

    expect(result.success).toBe(true);
  });

  it('shows friendly required messages for empty values', () => {
    const result = loginSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Ingresa tu email.',
      'Ingresa tu contrasena.',
    ]);
  });
});
