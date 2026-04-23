import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useRegister } from '@/shared/hooks';
import { BackButton, Button, PageHeader } from '@/shared/ui';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending } = useRegister();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.first_name.trim()) nextErrors.first_name = 'Campo requerido.';
    if (!form.last_name.trim()) nextErrors.last_name = 'Campo requerido.';
    if (!form.email.includes('@')) nextErrors.email = 'Email invalido.';
    if (form.password.length < 8) nextErrors.password = 'Minimo 8 caracteres.';
    if (form.password !== form.confirm) nextErrors.confirm = 'Las contrasenas no coinciden.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      });
      navigate('/');
    } catch (requestError) {
      setErrors({ email: getApiErrorMessage(requestError, 'No pudimos crear la cuenta.') });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader leading={<BackButton onClick={() => navigate(-1)} />} title="Crear cuenta" />

      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">
            Yak<span className="text-brand">ero</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">Crea tu cuenta para guardar direcciones y acumular puntos.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            error={errors.first_name}
            label="Nombre"
            onChange={(value) => setField('first_name', value)}
            value={form.first_name}
          />
          <Field
            error={errors.last_name}
            label="Apellido"
            onChange={(value) => setField('last_name', value)}
            value={form.last_name}
          />
        </div>

        <Field
          error={errors.email}
          label="Email"
          onChange={(value) => setField('email', value)}
          type="email"
          value={form.email}
        />
        <Field
          error={errors.phone}
          label="Telefono"
          onChange={(value) => setField('phone', value)}
          type="tel"
          value={form.phone}
        />
        <Field
          error={errors.password}
          label="Contrasena"
          onChange={(value) => setField('password', value)}
          type="password"
          value={form.password}
        />
        <Field
          error={errors.confirm}
          label="Confirmar contrasena"
          onChange={(value) => setField('confirm', value)}
          type="password"
          value={form.confirm}
        />

        <Button disabled={isPending} fullWidth onClick={() => void handleSubmit()}>
          {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Ya tienes cuenta:{' '}
          <Link className="font-semibold text-brand" to="/login">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  error,
  label,
  onChange,
  type = 'text',
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
