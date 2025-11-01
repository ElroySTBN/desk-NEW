import { useState, useEffect } from 'react';
import companyConfig from '@/config/company.json';

export interface CompanySettings {
  name: string;
  legalForm: string;
  siret: string;
  siren: string;
  tvaNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  logoUrl: string;
  bankName: string;
  iban: string;
  bic: string;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  priceHT: number;
  tvaRate: number;
  subscriptionType: string;
  isActive: boolean;
}

export function useCompanyConfig() {
  const [company, setCompany] = useState<CompanySettings>(companyConfig.company);
  const [products, setProducts] = useState<Product[]>(companyConfig.products);
  const [loading, setLoading] = useState(false);

  // Load from localStorage if modified
  useEffect(() => {
    const savedCompany = localStorage.getItem('company_settings');
    const savedProducts = localStorage.getItem('company_products');
    
    if (savedCompany) {
      setCompany(JSON.parse(savedCompany));
    }
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const updateCompany = (newSettings: Partial<CompanySettings>) => {
    const updated = { ...company, ...newSettings };
    setCompany(updated);
    localStorage.setItem('company_settings', JSON.stringify(updated));
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('company_products', JSON.stringify(newProducts));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: `prod_${Date.now()}`,
    };
    const updated = [...products, newProduct];
    updateProducts(updated);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    updateProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    updateProducts(updated);
  };

  const resetToDefaults = () => {
    setCompany(companyConfig.company);
    setProducts(companyConfig.products);
    localStorage.removeItem('company_settings');
    localStorage.removeItem('company_products');
  };

  return {
    company,
    products,
    loading,
    updateCompany,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaults,
  };
}

