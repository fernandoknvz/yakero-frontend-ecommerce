import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { useLogin } from '@/shared/hooks';
import { FormInput, type LoginFormValues, loginSchema } from '@/shared/forms';
import { useToast } from '@/shared/toast';
import { BackButton, Button, PageHeader } from '@/shared/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useToast();
  const { mutateAsync: login, isPending } = useLogin();
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      await login(values);
      pushToast({
        tone: 'success',
        title: 'Sesion iniciada',
        description: 'Bienvenido de vuelta.',
      });
      const nextPath = location.state?.from?.pathname ?? '/';
      navigate(nextPath);
    } catch (requestError) {
      pushToast({
        tone: 'error',
        title: 'No pudimos iniciar sesion',
        description: getApiErrorMessage(requestError, 'Email o contrasena incorrectos.'),
      });
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
          <p className="mt-2 text-sm text-gray-500">
            Ingresa a tu cuenta para revisar pedidos y puntos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
          <FormInput
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            type="email"
            {...register('email')}
          />
          <FormInput
            autoComplete="current-password"
            error={errors.password?.message}
            label="Contrasena"
            type="password"
            {...register('password')}
          />

          <Button disabled={!isValid || isPending} fullWidth type="submit">
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

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
