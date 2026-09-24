import type { Category } from '../types.js';

/** Categorias criadas automaticamente para todo novo usuário. */
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { name: 'Salário', type: 'ENTRADA', color: '#16a34a' },
  { name: 'Freelance', type: 'ENTRADA', color: '#0d9488' },
  { name: 'Investimentos', type: 'ENTRADA', color: '#2563eb' },
  { name: 'Outras entradas', type: 'ENTRADA', color: '#64748b' },
  { name: 'Alimentação', type: 'SAIDA', color: '#ea580c' },
  { name: 'Moradia', type: 'SAIDA', color: '#7c3aed' },
  { name: 'Transporte', type: 'SAIDA', color: '#0284c7' },
  { name: 'Saúde', type: 'SAIDA', color: '#dc2626' },
  { name: 'Educação', type: 'SAIDA', color: '#ca8a04' },
  { name: 'Lazer', type: 'SAIDA', color: '#db2777' },
  { name: 'Compras', type: 'SAIDA', color: '#9333ea' },
  { name: 'Assinaturas', type: 'SAIDA', color: '#0891b2' },
  { name: 'Outras saídas', type: 'SAIDA', color: '#64748b' },
];
