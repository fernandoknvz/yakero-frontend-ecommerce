import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useLogin } from '@/shared/hooks';
import { BackButton, Button, PageHeader } from '@/shared/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync: login, isPending } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Email o contrasena incorrectos.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader leading={<BackButton onClick={() => navigate(-1)} />} title="Iniciar sesion" />

      <div className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-10">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">
            Yak<span className="text-brand">ero</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">Ingresa a tu cuenta para revisar pedidos y puntos.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <input
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          type="email"
          value={email}
        />
        <input
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSubmit();
            }
          }}
          placeholder="Contrasena"
          type="password"
          value={password}
        />

        <Button disabled={!email || !password || isPending} fullWidth onClick={() => void handleSubmit()}>
          {isPending ? 'Ingresando...' : 'Ingresar'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Aun no tienes cuenta:{' '}
          <Link className="font-semibold text-brand" to="/register">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
