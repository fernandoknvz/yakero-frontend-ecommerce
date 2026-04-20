import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../../../shared/hooks';

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

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'Requerido';
    if (!form.last_name.trim()) e.last_name = 'Requerido';
    if (!form.email.includes('@')) e.email = 'Email inválido';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
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
    } catch {
      setErrors({ email: 'Ya existe una cuenta con ese email' });
    }
  };

  const Field = ({
    label, field, type = 'text', placeholder,
  }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[field]}
        onChange={(e) => set(field, e.target.value)}
        className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
          errors[field] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-8">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Crear cuenta</h1>
      </header>

      <div className="flex-1 flex items-start justify-center pt-8 px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-black text-gray-900">
              Yak<span className="text-red-600">ero</span>
            </h2>
            <p className="text-gray-400 text-sm mt-1">Crea tu cuenta y acumula puntos</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" field="first_name" placeholder="Juan" />
            <Field label="Apellido" field="last_name" placeholder="Pérez" />
          </div>
          <Field label="Email" field="email" type="email" placeholder="juan@email.com" />
          <Field label="Teléfono (opcional)" field="phone" type="tel" placeholder="+56 9 1234 5678" />
          <Field label="Contraseña" field="password" type="password" placeholder="Mínimo 8 caracteres" />
          <Field label="Confirmar contraseña" field="confirm" type="password" placeholder="Repite tu contraseña" />

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-base transition-colors"
          >
            {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-red-600 font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
