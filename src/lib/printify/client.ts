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

export interface PrintifyBlueprint {
  id: number;
  title: string;
  description: string;
  brand: string;
  model: string;
  images: string[];
}

export interface PrintifyProvider {
  id: number;
  title: string;
  decoration_methods: string[];
}

export interface PrintifyCatalogVariant {
  id: number;
  title: string;
  options: Record<string, string>;
  decoration_methods: string[];
}

interface PrintifyVariantResponse {
  id: number;
  title: string;
  variants: PrintifyCatalogVariant[];
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

export async function getPrintifyProduct(productId: string): Promise<PrintifyProduct> {
  const { shopId } = getPrintifyConfig();
  return printifyRequest<PrintifyProduct>(`/shops/${shopId}/products/${productId}.json`, {
    next: { revalidate: 300 },
  });
}

export function getPrintifyBlueprints() {
  return printifyRequest<PrintifyBlueprint[]>("/catalog/blueprints.json", {
    next: { revalidate: 3600 },
  });
}

export function getPrintifyBlueprint(blueprintId: number) {
  return printifyRequest<PrintifyBlueprint>(`/catalog/blueprints/${blueprintId}.json`, {
    next: { revalidate: 3600 },
  });
}

export function getPrintifyProviders(blueprintId: number) {
  return printifyRequest<PrintifyProvider[]>(`/catalog/blueprints/${blueprintId}/print_providers.json`, {
    next: { revalidate: 3600 },
  });
}

export async function getPrintifyVariants(blueprintId: number, providerId: number) {
  const response = await printifyRequest<PrintifyVariantResponse>(
    `/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`,
    { next: { revalidate: 3600 } },
  );

  return response.variants;
}
