import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/app.js';
import { createQueryClient } from './app/query-client.js';
import { ptBR } from './i18n/pt-br.js';

const container = document.getElementById('root');
if (container === null) throw new Error('Root element #root not found');

document.title = ptBR.app.productName;

createRoot(container).render(
  <StrictMode>
    <App queryClient={createQueryClient()} />
  </StrictMode>,
);
