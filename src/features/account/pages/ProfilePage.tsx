import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useAddresses, useAddAddress, useDeleteAddress } from '../../../shared/hooks';
import { formatCLP } from '../../../shared/utils/format';
import type { AddressInput } from '../../../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: addresses } = useAddresses();
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

  const handleAddAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.commune) return;
    await addAddress(newAddress);
    setShowAddressForm(false);
    setNewAddress({ label: '', street: '', number: '', commune: '', city: 'Santiago', is_default: false });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 text-xl">←</button>
        <h1 className="text-lg font-bold text-gray-900">Mi perfil</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* User card */}
        <section className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              {user.phone && <p className="text-gray-400 text-sm">{user.phone}</p>}
            </div>
          </div>
        </section>

        {/* Points */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tus puntos Yakero</p>
              <p className="text-3xl font-black mt-1">{user.points_balance}</p>
              <p className="text-gray-400 text-xs mt-1">
                = {formatCLP(user.points_balance)} de descuento disponible
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl px-3 py-2">
            <p className="text-xs text-gray-300">
              Acumulas 1 punto por cada $100 gastados. Canjéalos en tu próximo pedido.
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="bg-white rounded-2xl overflow-hidden">
          {[
            { label: 'Mis pedidos', icon: '📦', action: () => navigate('/account/orders') },
            { label: 'Mis direcciones', icon: '📍', action: () => {} }, // inline below
          ].map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
            >
              <span className="text-xl">{icon}</span>
              <span className="flex-1 font-medium text-gray-800">{label}</span>
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </section>

        {/* Addresses */}
        <section className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Mis direcciones</h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-red-600 text-sm font-semibold"
            >
              + Agregar
            </button>
          </div>

          {showAddressForm && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <input
                placeholder="Etiqueta (Casa, Trabajo...)"
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    placeholder="Calle"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <input
                  placeholder="Número"
                  value={newAddress.number}
                  onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <input
                placeholder="Comuna"
                value={newAddress.commune}
                onChange={(e) => setNewAddress({ ...newAddress, commune: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddAddress}
                  disabled={addingAddress}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 border border-gray-200 rounded-xl text-sm text-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {addresses && addresses.length === 0 && !showAddressForm && (
            <p className="text-gray-400 text-sm text-center py-4">
              No tienes direcciones guardadas
            </p>
          )}

          <div className="space-y-2">
            {addresses?.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {addr.street} {addr.number}, {addr.commune}
                  </p>
                </div>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="text-gray-300 hover:text-red-500 text-sm ml-2 flex-shrink-0"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full border-2 border-red-200 text-red-600 font-semibold py-3.5 rounded-2xl text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
