
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  nic_number?: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Company {
  id: string;
  name: string;
  contact_number: string;
  address?: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Transaction {
  id: string;
  customer_id?: string;
  company_id?: string;
  date: Date;
  quantity: number;
  payment_mode: string;
  bill_id: string;
  purchase_description?: string;
  additional_notes?: string;
  amount: number;
  type: 'credit' | 'debit';
  created_by: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Bill {
  id: string;
  serial_no: string;
  customer_name: string;
  admin_phone: string;
  date: Date;
  total_amount: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  status: string;
  history: HistoryEntry[];
}

export interface BillItem {
  id: string;
  bill_id: string;
  product_name: string;
  quantity: number;
  price: number;
  amount: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Product {
  id: string;
  name: string;
  last_price: number;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface Settings {
  id: string;
  shop_name: string;
  shop_address: string;
  admin_phone: string;
  last_bill_serial: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  action: string;
  timestamp: Date;
  user_id: string;
  user_name: string;
  changes: string;
  old_values?: any;
  new_values?: any;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  customers: Customer[];
  companies: Company[];
  customerTransactions: Transaction[];
  companyTransactions: Transaction[];
  bills: Bill[];
  billItems: BillItem[];
  products: Product[];
  settings: Settings;
  isLoading: boolean;
}

// Initial state with sample data
const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: "admin-001",
      email: "admin@admin.com",
      name: "Administrator",
      role: "ADMIN",
      phone: "+92-300-1234567",
      address: "Lahore, Pakistan",
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "system",
      updated_by: "system",
      history: []
    }
  ],
  customers: [
    {
      id: "customer-001",
      name: "Sample Customer",
      phone: "+92-300-1111111",
      address: "Sample Address",
      nic_number: "12345-6789012-3",
      balance: 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "admin-001",
      updated_by: "admin-001",
      history: []
    }
  ],
  companies: [
    {
      id: "company-001",
      name: "Sample Company",
      contact_number: "+92-300-2222222",
      address: "Sample Company Address",
      balance: 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "admin-001",
      updated_by: "admin-001",
      history: []
    }
  ],
  customerTransactions: [
    {
      id: "ct-001",
      customer_id: "customer-001",
      date: new Date(),
      quantity: 5,
      payment_mode: "Cash",
      bill_id: "AMR-8001",
      purchase_description: "Sample purchase",
      additional_notes: "Sample notes",
      amount: 1500.00,
      type: "credit",
      created_by: "admin-001",
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: "admin-001",
      history: []
    }
  ],
  companyTransactions: [
    {
      id: "comt-001",
      company_id: "company-001",
      date: new Date(),
      quantity: 10,
      payment_mode: "Bank Transfer",
      bill_id: "AMR-8002",
      purchase_description: "Sample company transaction",
      additional_notes: "Sample company notes",
      amount: 2500.00,
      type: "debit",
      created_by: "admin-001",
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: "admin-001",
      history: []
    }
  ],
  bills: [
    {
      id: "bill-001",
      serial_no: "AMR-8001",
      customer_name: "Sample Customer",
      admin_phone: "+92-300-1234567",
      date: new Date(),
      total_amount: 1500.00,
      created_by: "admin-001",
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: "admin-001",
      status: "completed",
      history: []
    }
  ],
  billItems: [
    {
      id: "bi-001",
      bill_id: "bill-001",
      product_name: "Radiator Core",
      quantity: 2,
      price: 750.00,
      amount: 1500.00,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "admin-001",
      updated_by: "admin-001",
      history: []
    }
  ],
  products: [
    {
      id: "prod-001",
      name: "Radiator Core",
      last_price: 750.00,
      usage_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "admin-001",
      updated_by: "admin-001",
      history: []
    },
    {
      id: "prod-002",
      name: "Cooling Fan",
      last_price: 500.00,
      usage_count: 1,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: "admin-001",
      updated_by: "admin-001",
      history: []
    }
  ],
  settings: {
    id: "settings-001",
    shop_name: "Al Mehran Radiator",
    shop_address: "Main Market, Lahore, Pakistan",
    admin_phone: "+92-300-1234567",
    last_bill_serial: 8000,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: "system",
    updated_by: "admin-001",
    history: []
  },
  isLoading: false
};

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_COMPANY'; payload: Company }
  | { type: 'UPDATE_COMPANY'; payload: Company }
  | { type: 'DELETE_COMPANY'; payload: string }
  | { type: 'ADD_CUSTOMER_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_COMPANY_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'ADD_BILL_ITEM'; payload: BillItem }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_SETTINGS'; payload: Settings };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.payload)
      };
    case 'ADD_COMPANY':
      return { ...state, companies: [...state.companies, action.payload] };
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    case 'DELETE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter(c => c.id !== action.payload)
      };
    case 'ADD_CUSTOMER_TRANSACTION':
      return {
        ...state,
        customerTransactions: [...state.customerTransactions, action.payload]
      };
    case 'ADD_COMPANY_TRANSACTION':
      return {
        ...state,
        companyTransactions: [...state.companyTransactions, action.payload]
      };
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };
    case 'ADD_BILL_ITEM':
      return { ...state, billItems: [...state.billItems, action.payload] };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addHistoryEntry: (entity: any, action: string, userId: string, userName: string, changes: string, oldValues?: any, newValues?: any) => void;
  generateId: (prefix: string) => string;
  calculateCustomerBalance: (customerId: string) => number;
  calculateCompanyBalance: (companyId: string) => number;
} | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addHistoryEntry = (entity: any, action: string, userId: string, userName: string, changes: string, oldValues: any = null, newValues: any = null) => {
    const historyEntry: HistoryEntry = {
      action,
      timestamp: new Date(),
      user_id: userId,
      user_name: userName,
      changes,
      old_values: oldValues,
      new_values: newValues
    };
    
    entity.history = entity.history || [];
    entity.history.unshift(historyEntry);
    entity.updated_at = new Date();
    entity.updated_by = userId;
  };

  const generateId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const calculateCustomerBalance = (customerId: string): number => {
    return state.customerTransactions
      .filter(t => t.customer_id === customerId)
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  };

  const calculateCompanyBalance = (companyId: string): number => {
    return state.companyTransactions
      .filter(t => t.company_id === companyId)
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      addHistoryEntry, 
      generateId,
      calculateCustomerBalance,
      calculateCompanyBalance
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
