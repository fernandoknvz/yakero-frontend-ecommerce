# Yakero Ecommerce — Frontend

SPA construida con **React 18 + TypeScript + Vite**.  
Arquitectura por features, estado con Zustand + React Query, UX mobile-first.

---

## Stack

| Capa         | Tecnología             |
| ------------ | ---------------------- |
| Framework    | React 18               |
| Build        | Vite 5                 |
| Tipado       | TypeScript 5           |
| Routing      | React Router 6         |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5              |
| HTTP         | Axios                  |
| Estilos      | Tailwind CSS 3         |

---

## Levantar en desarrollo

```bash
git clone https://github.com/yakero/yakero-frontend.git
cd yakero-frontend

npm install

cp .env.example .env
# Asegúrate de que VITE_API_BASE_URL apunte al backend

npm run dev
# → http://localhost:5173
```

---

## Estructura

```
src/
├── features/
│   ├── menu/            # Home, ProductCard, ProductModal, PromotionCard
│   ├── cart/            # CartFab, CartDrawer, cartStore (Zustand)
│   ├── checkout/        # CheckoutPage, PaymentResultPages
│   ├── auth/            # LoginPage, RegisterPage
│   └── account/         # ProfilePage, OrderHistoryPage, OrderTrackingPage
├── shared/
│   ├── api/             # client.ts (axios + todos los endpoints)
│   ├── components/      # BottomNav
│   ├── hooks/           # index.ts (todos los React Query hooks)
│   └── utils/           # format.ts
├── stores/
│   └── authStore.ts     # JWT + user (Zustand persistido)
├── router/
│   ├── index.tsx        # createBrowserRouter con lazy loading
│   └── AppLayout.tsx
├── types/
│   └── index.ts         # Todos los tipos TS alineados con el backend
└── styles/
    └── index.css
```

---

## Pantallas

| Ruta                | Componente           | Descripción                                     |
| ------------------- | -------------------- | ----------------------------------------------- |
| `/`                 | `HomePage`           | Menú completo con navegación por categorías     |
| `/checkout`         | `CheckoutPage`       | Delivery/retiro, dirección, cupón, puntos, pago |
| `/checkout/success` | `PaymentSuccessPage` | Confirmación visual y espera de webhook         |
| `/checkout/failure` | `PaymentFailurePage` | Pago rechazado sin crear pedido                 |
| `/checkout/pending` | `PaymentPendingPage` | Pago en proceso                                 |
| `/orders/:id`       | `OrderTrackingPage`  | Seguimiento en tiempo real (polling 15s)        |
| `/account/orders`   | `OrderHistoryPage`   | Historial con pedidos activos destacados        |
| `/account`          | `ProfilePage`        | Perfil, puntos, direcciones                     |
| `/login`            | `LoginPage`          | Login con JWT                                   |
| `/register`         | `RegisterPage`       | Registro de cuenta                              |

---

## Flujo de compra

```
HomePage → ProductModal (elegir modificadores)
         → CartFab / CartDrawer (ver carrito)
         → CheckoutPage (delivery/retiro + cupón + puntos)
         → POST /api/v1/payments/create-preference
         → redirect a MercadoPago
         → webhook approved crea el pedido real
         → /checkout/success → /account/orders
```

---

## Estado del carrito

El carrito usa **Zustand con `persist`**, guardado en `localStorage` bajo la clave `yakero_cart`. Sobrevive recargas de página.

---

## Seguimiento de pedidos

`useOrder(id)` hace polling automático cada 15 segundos mientras el pedido no está en estado terminal (`entregado`, `cancelado`, `anulado`). El cliente ve actualizaciones sin necesidad de recargar la página.

---

## Build para producción

```bash
npm run build
# Genera dist/ optimizado con code splitting automático
```
