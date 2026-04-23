import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAddAddress, useAddresses, useDeleteAddress } from '@/shared/hooks';
import { BackButton, Button, EmptyState, PageHeader, SectionCard } from '@/shared/ui';
import { formatCLP } from '@/shared/utils/format';
import { useAuthStore } from '@/stores/authStore';
import type { AddressInput } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: addresses = [] } = useAddresses();
  const { mutateAsync: addAddress, isPending: addingAddress } = useAddAddress();
  const { mutateAsync: deleteAddress } = useDeleteAddress();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressInput>({
    label: '',
    street: '',
    number: '',
    commune: '',
    city: 'Santiago',
    is_default: false,
  });

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.commune) {
      return;
    }

    await addAddress(newAddress);
    setShowAddressForm(false);
    setNewAddress({
      label: '',
      street: '',
      number: '',
      commune: '',
      city: 'Santiago',
      is_default: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader leading={<BackButton onClick={() => navigate(-1)} />} title="Mi perfil" />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <SectionCard>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-brand">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.phone ? <p className="text-sm text-gray-500">{user.phone}</p> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard className="bg-gray-950 text-white" title="Puntos Yakero">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-white">{user.points_balance}</p>
              <p className="mt-2 text-sm text-gray-300">
                Equivalen a {formatCLP(user.points_balance)} para futuros descuentos.
              </p>
            </div>
            <div className="text-3xl text-brand">*</div>
          </div>
        </SectionCard>

        <SectionCard title="Acciones rapidas">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button fullWidth onClick={() => navigate('/account/orders')} variant="secondary">
              Ver mis pedidos
            </Button>
            <Button
              fullWidth
              onClick={() => setShowAddressForm((value) => !value)}
              variant="secondary"
            >
              {showAddressForm ? 'Ocultar formulario' : 'Agregar direccion'}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Mis direcciones">
          {showAddressForm ? (
            <div className="mb-4 space-y-3 rounded-2xl bg-gray-50 p-4">
              <Field
                label="Etiqueta"
                onChange={(value) => setNewAddress({ ...newAddress, label: value })}
                value={newAddress.label}
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field
                    label="Calle"
                    onChange={(value) => setNewAddress({ ...newAddress, street: value })}
                    value={newAddress.street}
                  />
                </div>
                <Field
                  label="Numero"
                  onChange={(value) => setNewAddress({ ...newAddress, number: value })}
                  value={newAddress.number}
                />
              </div>
              <Field
                label="Comuna"
                onChange={(value) => setNewAddress({ ...newAddress, commune: value })}
                value={newAddress.commune}
              />
              <div className="flex gap-2">
                <Button disabled={addingAddress} onClick={() => void handleAddAddress()}>
                  {addingAddress ? 'Guardando...' : 'Guardar direccion'}
                </Button>
                <Button onClick={() => setShowAddressForm(false)} variant="secondary">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          {!addresses.length ? (
            <EmptyState
              description="Guardar direcciones acelera checkout y habilita calculo de delivery."
              icon="⌂"
              title="No tienes direcciones guardadas"
            />
          ) : (
            <div className="space-y-2">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between rounded-2xl bg-gray-50 p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{address.label}</span>
                      {address.is_default ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {address.street} {address.number}, {address.commune}
                    </p>
                  </div>
                  <Button onClick={() => void deleteAddress(address.id)} variant="ghost">
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <Button
          fullWidth
          onClick={() => {
            logout();
            navigate('/');
          }}
          variant="danger"
        >
          Cerrar sesion
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}
