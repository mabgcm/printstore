import "server-only";

const PRINTIFY_API_URL = "https://api.printify.com/v1";

export interface PrintifyImage {
  src: string;
  position: string;
  is_default: boolean;
  variant_ids: number[];
}

export interface PrintifyVariant {
  id: number;
  sku: string;
  title: string;
  price: number;
  cost: number;
  is_enabled: boolean;
  is_available: boolean;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PrintifyImage[];
  variants: PrintifyVariant[];
  visible: boolean;
  blueprint_id: number;
  print_provider_id: number;
}

interface PrintifyProductPage {
  current_page: number;
  last_page: number;
  data: PrintifyProduct[];
}

function getPrintifyConfig() {
  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!token || !shopId) {
    throw new Error("PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID must be configured.");
  }

  return { token, shopId };
}

async function printifyRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = getPrintifyConfig();
  const response = await fetch(`${PRINTIFY_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "Printstore/1.0",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Printify request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function getPrintifyProducts(): Promise<PrintifyProduct[]> {
  const { shopId } = getPrintifyConfig();
  const response = await printifyRequest<PrintifyProductPage>(
    `/shops/${shopId}/products.json?limit=50`,
    { next: { revalidate: 300 } },
  );

  return response.data.filter((product) => product.visible);
}
