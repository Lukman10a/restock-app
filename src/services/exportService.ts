import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { BASE_URL, getAccessToken } from "./apiClient";

export type ExportFilters = {
  startDate: string;
  endDate: string;
  status?: "processed" | "edited" | "all";
};

export async function exportReceiptsAsCSV(
  filters: ExportFilters,
): Promise<void> {
  const { startDate, endDate, status = "all" } = filters;
  const query = new URLSearchParams({
    startDate,
    endDate,
    ...(status !== "all" ? { status } : {}),
  }).toString();

  const token = await getAccessToken();
  const downloadUrl = `${BASE_URL}/export/receipts/csv?${query}`;

  // Download to a local file
  // const localUri = `${FileSystem.cacheDirectory}restock_export_${Date.now()}.csv`;
  const localUri =
    FileSystem.Paths.cache.uri + `restock_export_${Date.now()}.csv`;

  const result = await FileSystem.downloadAsync(downloadUrl, localUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (result.status !== 200) {
    throw new Error("Failed to download export file");
  }

  // Open native share sheet
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error("Sharing is not available on this device");
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: "text/csv",
    dialogTitle: "Export Restock Receipts",
    UTI: "public.comma-separated-values-text",
  });
}

// export async function uploadReceiptImage(imageUri: string): Promise<{ imageUrl: string; imagePublicId: string }> {
//   const token = await getAccessToken();
//   const formData = new FormData();

//   formData.append('file', {
//     uri: imageUri,
//     name: 'receipt.jpg',
//     type: 'image/jpeg',
//   } as any);

//   const res = await fetch(`${BASE_URL}/upload/receipt-image`, {
//     method: 'POST',
//     headers: {
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: formData,
//   });

//   if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
//   return res.json();
// }

export async function uploadReceiptImage(imageUri: string) {
  console.log("==== UPLOAD START ====");
  console.log("URI:", imageUri);

  const token = await getAccessToken();

  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: `receipt-${Date.now()}.jpg`,
    type: "image/jpeg",
  } as any);

  console.log("Sending request to", `${BASE_URL}/upload/receipt-image`);

  const response = await axios.post(
    `${BASE_URL}/upload/receipt-image`,
    formData,
    {
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
        "Content-Type": "multipart/form-data",
      },
    },
  );

  console.log("UPLOAD SUCCESS:", response.data);

  return {
    imageUrl: response.data.url,
    imagePublicId: response.data.publicId,
  };
}
