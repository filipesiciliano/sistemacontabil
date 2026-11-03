import type { ReactNode } from 'react';
import { ptBR } from '../i18n/pt-br.js';
import './app-shell.css';

export function AppShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <span className="app-shell__product">{ptBR.app.productName}</span>
        <span className="app-shell__tagline">{ptBR.app.tagline}</span>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
