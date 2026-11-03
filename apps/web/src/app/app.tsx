import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { ptBR } from '../i18n/pt-br.js';
import { AppShell } from '../layout/app-shell.js';

export function App({ queryClient }: { readonly queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <h1>{ptBR.home.title}</h1>
        <p>{ptBR.home.description}</p>
      </AppShell>
    </QueryClientProvider>
  );
}
