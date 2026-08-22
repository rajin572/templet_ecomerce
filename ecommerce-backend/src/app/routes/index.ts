import express from 'express';
import { CategoryRoutes } from '../../modules/category/category.routes';
import { ProductRoutes } from '../../modules/product/product.routes';
import { OrderRoutes } from '../../modules/order/order.routes';
import { CustomerRoutes } from '../../modules/customer/customer.routes';
import { FinanceRoutes } from '../../modules/finance/finance.routes';
import { SettingsRoutes } from '../../modules/settings/settings.routes';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import { StaffRoutes } from '../../modules/staff/staff.routes';

import { RoleRoutes } from '../../modules/role/role.route';
import { PermissionRoutes } from '../../modules/permission/permission.route';
import { AddressRoutes } from '../../modules/address/address.route';
import { UserRoutes } from '../../modules/user/user.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/categories', route: CategoryRoutes },
  { path: '/products', route: ProductRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/customers', route: CustomerRoutes },
  { path: '/finances', route: FinanceRoutes },
  { path: '/settings', route: SettingsRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/staff', route: StaffRoutes },
  { path: '/roles', route: RoleRoutes },
  { path: '/permissions', route: PermissionRoutes },
  { path: '/addresses', route: AddressRoutes },
  { path: '/users', route: UserRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
