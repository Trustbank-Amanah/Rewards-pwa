export interface Profile {
    id: string;
    role: 'customer' | 'merchant' | 'bank_admin';
    full_name: string | null;
    email: string | null;
    account_number: string | null;
    status: string;
  }
  
  export interface Voucher {
    id: string;
    voucher_number: string;
    current_balance: number;
    initial_amount: number;
    currency: string;
    status: string;
    expires_at: string | null;
  }
  
  export interface MerchantAd {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    cta_text: string | null;
    merchant_name: string;
  }
  
  export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    reference: string;
    status: string;
    created_at: string;
    merchant_name: string | null;
  }

  // lib/types.ts

export interface MerchantAd {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  merchant_name: string;
}