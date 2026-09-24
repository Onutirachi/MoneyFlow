import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrivateRoute, PublicOnlyRoute } from '@/components/layout/RouteGuards';
import { LoginPage } from '@/pages/Login';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { RegisterPage } from '@/pages/Register';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'cadastro', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <PlaceholderPage title="Dashboard" /> },
          { path: 'movimentos', element: <PlaceholderPage title="Movimentos" /> },
          { path: 'contas', element: <PlaceholderPage title="Contas" /> },
          { path: 'custos-fixos', element: <PlaceholderPage title="Custos fixos" /> },
          { path: 'categorias', element: <PlaceholderPage title="Categorias" /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
