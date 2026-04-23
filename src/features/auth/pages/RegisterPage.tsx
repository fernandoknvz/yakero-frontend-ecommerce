import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '@/shared/api/errors';
import { FormInput, registerSchema, type RegisterFormValues } from '@/shared/forms';
import { useRegister } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { BackButton, Button, PageHeader } from '@/shared/ui';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { mutateAsync: registerUser, isPending } = useRegister();
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      confirm: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      phone: '',
    },
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone || undefined,
      });
      pushToast({
        tone: 'success',
        title: 'Cuenta creada',
        description: 'Tu perfil ya esta listo para comprar.',
      });
      navigate('/');
    } catch (requestError) {
      pushToast({
        tone: 'error',
        title: 'No pudimos crear la cuenta',
        description: getApiErrorMessage(requestError),
      });
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
          <p className="mt-2 text-sm text-gray-500">
            Crea tu cuenta para guardar direcciones y acumular puntos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              error={errors.first_name?.message}
              label="Nombre"
              {...register('first_name')}
            />
            <FormInput
              error={errors.last_name?.message}
              label="Apellido"
              {...register('last_name')}
            />
          </div>
          <FormInput
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            type="email"
            {...register('email')}
          />
          <FormInput
            autoComplete="tel"
            error={errors.phone?.message}
            label="Telefono"
            type="tel"
            {...register('phone')}
          />
          <FormInput
            autoComplete="new-password"
            error={errors.password?.message}
            label="Contrasena"
            type="password"
            {...register('password')}
          />
          <FormInput
            autoComplete="new-password"
            error={errors.confirm?.message}
            label="Confirmar contrasena"
            type="password"
            {...register('confirm')}
          />

          <Button disabled={!isValid || isPending} fullWidth type="submit">
            {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

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
