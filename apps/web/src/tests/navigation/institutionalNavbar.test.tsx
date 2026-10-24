import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstitutionalNavbar } from '@/features/navigation/components/InstitutionalNavbar';

describe('InstitutionalNavbar', () => {
  it('não vaza a árvore de artigos nem a busca interna', () => {
    render(
      <InstitutionalNavbar
        isDarkMode={false}
        onToggleTheme={() => {}}
        isAuthenticated={false}
      />
    );

    // Garante que menus de categorias não aparecem
    expect(screen.queryByText('eSocial')).toBeNull();
    expect(screen.queryByText('GRO')).toBeNull();
    expect(screen.queryByPlaceholderText(/buscar/i)).toBeNull();

    // Garante links da landing page e CTAs
    expect(screen.getByText('Visão Geral')).toBeDefined();
    expect(screen.getByText('Recursos')).toBeDefined();
    expect(screen.getByText('Experimentar')).toBeDefined();
  });
});
