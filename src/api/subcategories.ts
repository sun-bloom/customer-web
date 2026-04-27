const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:4040";

import type { Subcategory } from "../types";

export async function getSubcategories(): Promise<Subcategory[]> {
  try {
    const response = await fetch(`${API_URL}/api/subcategories`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.subcategories || [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export async function getSubcategoryById(
  id: string,
): Promise<Subcategory | undefined> {
  try {
    const response = await fetch(`${API_URL}/api/subcategories/${id}`);
    if (!response.ok) {
      return undefined;
    }
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function getSubcategoriesByCategory(
  categoryId?: string,
): Promise<Subcategory[]> {
  const subcategories = await getSubcategories();

  if (!categoryId) {
    return subcategories;
  }

  return subcategories.filter((s) => s.categoryId === categoryId);
}

export async function getSubcategoriesByCategorySlug(
  categorySlug?: string,
): Promise<Subcategory[]> {
  const subcategories = await getSubcategories();

  if (!categorySlug) {
    return subcategories;
  }

  return subcategories.filter(
    (s) => s.category?.slug === categorySlug,
  );
}

export async function getSubcategoryByIdFromCache(
  id: string,
): Promise<Subcategory | undefined> {
  const subcategories = await getSubcategories();
  return subcategories.find((s) => s.id === id);
}

export function getSubcategoryName(
  subcategoryId: string | undefined,
  subcategories: Subcategory[],
): string | undefined {
  if (!subcategoryId) return undefined;
  const subcategory = subcategories.find((s) => s.id === subcategoryId);
  return subcategory?.name;
}