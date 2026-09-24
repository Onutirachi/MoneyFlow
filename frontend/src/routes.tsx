import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export const router = createBrowserRouter([
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
]);
