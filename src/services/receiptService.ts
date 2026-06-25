import { apiFetch } from "./apiClient";

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
  _id: string;
  id?: string;
  vendorName: string;
  vendorAddress?: string;
  purchaseDate?: string;
  date: string;
  totalAmount: number;
  currency: string;
  imageUrl?: string;
  status: "pending" | "processed" | "failed" | "manually_edited";
  ocrConfidence?: number;
  items?: ReceiptItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export async function getDashboard(
  year: number,
  month?: number,
): Promise<DashboardData> {
  const query = month ? `year=${year}&month=${month}` : `year=${year}`;
  const data = await apiFetch(`/dashboard?${query}`);

  // console.log("RAW DASHBOARD:", data);

  return {
    totalSpent: data.overview?.totalSpend ?? 0,
    receiptCount: data.overview?.receiptCount ?? 0,
    averagePerReceipt: data.overview?.avgPerReceipt ?? 0,
    itemsTracked: data.overview?.totalItems ?? 0,

    // ⚠️ you don’t have weeklySpend → fake or compute
    weeklySpend: 0,

    monthlyBreakdown: data.monthlyBreakdown?.months ?? [],

    topVendors:
      data.topVendors?.map((v: any) => ({
        name: v.vendorName,
        totalSpend: v.totalSpend,
        visits: v.visitCount,
      })) ?? [],

    recentReceipts:
      data.recentReceipts?.map((r: any) => ({
        ...r,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
      })) ?? [],
  };
}

export async function getReceipts(status?: string): Promise<Receipt[]> {
  const query =
    status && status !== "All" ? `?status=${status.toLowerCase()}` : "";
  return apiFetch(`/receipts${query}`);
}

export async function getReceiptById(id: string): Promise<Receipt> {
  const data = await apiFetch(`/receipts/${id}`);

  console.log("RECEIPT DATA:", data);
  console.log(JSON.stringify(data, null, 2));

  return {
    _id: data._id,

    vendorName: data.vendorName || "",

    purchaseDate: data.purchaseDate,

    date: data.purchaseDate
      ? new Date(data.purchaseDate).toLocaleDateString()
      : "",

    totalAmount: data.totalAmount || 0,

    currency: data.currency || "USD",

    status: data.status,

    imageUrl: data.imageUrl,

    items:
      data.items?.map((item: any) => ({
        id: item._id?.toString() ?? Math.random().toString(),
        name: item.name,
        qty: item.quantity,
        price: item.totalPrice,
      })) || [],
  };
}

export async function updateReceipt(
  id: string,
  payload: Partial<Receipt>,
): Promise<Receipt> {
  return apiFetch(`/receipts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteReceipt(id: string): Promise<void> {
  return apiFetch(`/receipts/${id}`, { method: "DELETE" });
}

export async function deleteAllReceipts(): Promise<void> {
  return apiFetch("/receipts", { method: "DELETE" });
}

export async function reprocessReceipt(id: string): Promise<Receipt> {
  return apiFetch(`/receipts/${id}/reprocess`, { method: "POST" });
}

export async function createReceipt(
  imageUrl: string,
  imagePublicId: string,
): Promise<Receipt> {
  return apiFetch("/receipts", {
    method: "POST",
    body: JSON.stringify({ imageUrl, imagePublicId }),
  });
}

export async function pollReceiptStatus(
  id: string,
  onDone: (r: Receipt) => void,
): Promise<void> {
  if (!id) {
    console.error("pollReceiptStatus called without id");
    return;
  }

  console.log("Polling receipt", id);

  const interval = setInterval(async () => {
    try {
      const receipt = await getReceiptById(id);

      console.log("Receipt status:", receipt.status);

      if (
        receipt.status === "processed" ||
        receipt.status === "failed" ||
        receipt.status === "manually_edited"
      ) {
        clearInterval(interval);

        onDone(receipt);
      }
    } catch (err) {
      console.error("POLL ERROR", err);

      clearInterval(interval);
    }
  }, 2000);
}
