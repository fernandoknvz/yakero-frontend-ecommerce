import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../../shared/hooks';

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
    } catch {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Iniciar sesión</h1>
      </header>

      <div className="flex-1 flex items-start justify-center pt-10 px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900">
              Yak<span className="text-red-600">ero</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Ingresa a tu cuenta</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!email || !password || isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-base transition-colors"
          >
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-red-600 font-semibold">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
