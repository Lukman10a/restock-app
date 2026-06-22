import { apiFetch } from './apiClient';

export type DashboardData = {
  totalSpent: number;
  receiptCount: number;
  averagePerReceipt: number;
  itemsTracked: number;
  weeklySpend: number;
  monthlyBreakdown: { month: string; amount: number }[];
  topVendors: { name: string; totalSpend: number; visits: number }[];
  recentReceipts: Receipt[];
};

export type Receipt = {
  id: string;
  vendor: string;
  date: string;
  total: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed' | 'edited';
  imageUrl?: string;
  items?: ReceiptItem[];
};

export type ReceiptItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export async function getDashboard(year: number, month?: number): Promise<DashboardData> {
  const query = month ? `year=${year}&month=${month}` : `year=${year}`;
  return apiFetch(`/dashboard?${query}`);
}

export async function getReceipts(status?: string): Promise<Receipt[]> {
  const query = status && status !== 'All' ? `?status=${status.toLowerCase()}` : '';
  return apiFetch(`/receipts${query}`);
}

export async function getReceiptById(id: string): Promise<Receipt> {
  return apiFetch(`/receipts/${id}`);
}

export async function updateReceipt(id: string, payload: Partial<Receipt>): Promise<Receipt> {
  return apiFetch(`/receipts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteReceipt(id: string): Promise<void> {
  return apiFetch(`/receipts/${id}`, { method: 'DELETE' });
}

export async function deleteAllReceipts(): Promise<void> {
  return apiFetch('/receipts', { method: 'DELETE' });
}

export async function reprocessReceipt(id: string): Promise<Receipt> {
  return apiFetch(`/receipts/${id}/reprocess`, { method: 'POST' });
}

export async function createReceipt(imageUrl: string, imagePublicId: string): Promise<Receipt> {
  return apiFetch('/receipts', {
    method: 'POST',
    body: JSON.stringify({ imageUrl, imagePublicId }),
  });
}

export async function pollReceiptStatus(id: string, onDone: (r: Receipt) => void): Promise<void> {
  const interval = setInterval(async () => {
    try {
      const receipt = await getReceiptById(id);
      if (receipt.status !== 'pending') {
        clearInterval(interval);
        onDone(receipt);
      }
    } catch {
      clearInterval(interval);
    }
  }, 2000);
}
