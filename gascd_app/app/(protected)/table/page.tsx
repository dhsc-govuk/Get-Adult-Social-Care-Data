import React from 'react';
import Layout from '@/components/common/layout/Layout';
import DataTable from '@/components/tables/Table';

const TablePage: React.FC = () => {
  const mockColumnHeaders = [
    'Location',
    'Suffolk',
    'East of England Region',
    'All England',
  ];
  const mockRowHeaders = [
    'Total beds',
    'Dementia nursing',
    'Dementia residential',
  ];
  const mockData = {
    'Total beds': {
      Suffolk: '100',
      'East of England Region': '200',
      'All England': '300',
    },
    'Dementia nursing': {
      Suffolk: '100',
      'East of England Region': '200',
      'All England': '300',
    },
    'Dementia residential': {
      Suffolk: '100',
      'East of England Region': '200',
      'All England': '300',
    },
  };

  return (
    <Layout showLoginInformation={true} currentPage="table" showNavBar={false}>
      <DataTable
        columnHeaders={mockColumnHeaders}
        rowHeaders={mockRowHeaders}
        data={mockData}
      ></DataTable>
    </Layout>
  );
};

export default TablePage;
