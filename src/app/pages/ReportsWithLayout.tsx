import React from 'react';
import { Layout } from '../components/Layout';
import ReportsListPage from './ReportsListPage';

export function ReportsWithLayout() {
  return (
    <Layout>
      <ReportsListPage />
    </Layout>
  );
}
