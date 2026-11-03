import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/app/app.js';
import { createQueryClient } from '../src/app/query-client.js';
import { PRODUCT_NAME } from '../src/i18n/product-name.js';

describe('App', () => {
  it('shows the product name from the single PRODUCT_NAME constant', () => {
    render(<App queryClient={createQueryClient()} />);
    expect(screen.getByText(PRODUCT_NAME)).toBeInTheDocument();
  });

  it('renders the home heading', () => {
    render(<App queryClient={createQueryClient()} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Fundação do projeto');
  });
});
