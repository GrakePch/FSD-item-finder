import { fetchWithCache } from "./apiFetch";

export async function fetchCategoriesAttributes(): Promise<UexCategoryAttribute[]> {
  const res = await fetchWithCache(
    "categories_attributes",
    "https://api.uexcorp.space/2.0/categories_attributes"
  );
  return res.data || [];
}
