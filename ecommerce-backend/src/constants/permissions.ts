export const PERMISSIONS = {
  // Catalog
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_UPDATE: 'product.update',
  PRODUCT_DELETE: 'product.delete',
  PRODUCT_PUBLISH: 'product.publish',
  PRODUCT_VIEW_COST: 'product.view_cost',
  PRODUCT_EXPORT: 'product.export',

  // Category
  CATEGORY_VIEW: 'category.view',
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  // Brand
  BRAND_VIEW: 'brand.view',
  BRAND_CREATE: 'brand.create',
  BRAND_UPDATE: 'brand.update',
  BRAND_DELETE: 'brand.delete',

  // Order
  ORDER_VIEW: 'order.view',
  ORDER_CONFIRM: 'order.confirm',
  ORDER_UPDATE: 'order.update',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_UPDATE: 'inventory.update',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_SHIPPING: 'settings.shipping',

  // Banner
  BANNER_VIEW: 'banner.view',
  BANNER_CREATE: 'banner.create',
  BANNER_UPDATE: 'banner.update',
  BANNER_DELETE: 'banner.delete',

  // Coupon
  COUPON_VIEW: 'coupon.view',
  COUPON_CREATE: 'coupon.create',
  COUPON_UPDATE: 'coupon.update',
  COUPON_DELETE: 'coupon.delete',

  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_CREATE: 'staff.create',
  STAFF_UPDATE: 'staff.update',
  STAFF_MANAGE_ROLES: 'staff.manage_roles',
  STAFF_MANAGE_PERMISSIONS: 'staff.manage_permissions',

  // Finance
  FINANCE_VIEW: 'finance.view',

  // Remittance
  REMITTANCE_VIEW: 'remittance.view',
  REMITTANCE_CREATE: 'remittance.create',
} as const;

export type TPermission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
