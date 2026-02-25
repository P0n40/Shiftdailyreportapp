import React from 'react';
import { Layout } from '../components/Layout';
import StatisticsPage from './StatisticsPage';

export function StatisticsWithLayout() {
  return (
    <Layout>
      <StatisticsPage />
    </Layout>
  );
}
