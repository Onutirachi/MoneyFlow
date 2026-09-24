import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { PrivateRoute, PublicOnlyRoute } from '@/components/layout/RouteGuards';
import { AccountsPage } from '@/pages/Accounts';
import { CategoriesPage } from '@/pages/Categories';
import { LoginPage } from '@/pages/Login';
import { MovementsPage } from '@/pages/Movements';
import { RecurringPage } from '@/pages/Recurring';
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
          {
            index: true,
            // lazy: os gráficos (recharts) ficam fora do bundle inicial
            lazy: async () => ({ Component: (await import('@/pages/Dashboard')).DashboardPage }),
          },
          { path: 'movimentos', element: <MovementsPage /> },
          { path: 'contas', element: <AccountsPage /> },
          { path: 'custos-fixos', element: <RecurringPage /> },
          { path: 'categorias', element: <CategoriesPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
