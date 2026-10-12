import { ApiRequest } from "../apiRequest";

/**
 * Ambil semua product (optional filter)
 */
export const getProducts = async ({
  page = 1,
  limit = 50,
  search = "",
  category_id = "",
} = {}) => {
  const params = { page, limit, search };

  if (category_id) {
    params.category_id = category_id;
  }

  const res = await ApiRequest({
    url: "/products",
    method: "GET",
    params,
  });

  if (res?.status !== "success") {
    return { data: [], meta: {} };
  }

  return {
    data: res.data || [],
    meta: res.meta || {},
  };
};

/**
 * Ambil product berdasarkan category (helper khusus)
 */
export const getProductsByCategory = async (categoryId, options = {}) => {
  if (!categoryId) return [];

  return await getProducts({
    ...options,
    category_id: categoryId,
  });
};

/**
 * Ambil product map (product_id → product)
 * berguna buat join manual claim
 */
export const getProductMap = async (options = {}) => {
  let page = 1;
  let totalPage = 1;
  const productMap = {};

  do {
    const res = await getProducts({
      page,
      limit: 200, // ⬅️ limit maksimal backend
      ...options,
    });

    // kalau backend pakai meta
    const meta = res?.meta || {};
    totalPage = meta.total_page || totalPage;

    (res?.data || []).forEach((p) => {
      productMap[p.product_id] = p;
    });

    page++;
  } while (page <= totalPage);

  return productMap;
};

export const getAllProductsByCategory = async (categoryId, options = {}) => {
  if (!categoryId) return [];

  let page = 1;
  let totalPage = 1;
  const allProducts = [];

  do {
    const res = await getProducts({
      ...options,
      category_id: categoryId,
      page,
      limit: options.limit || 200,
    });

    allProducts.push(...(res.data || []));

    totalPage = res?.meta?.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allProducts;
};
