import { Permission } from './permission.model';

const getPermissions = async () => {
  // Group by module (if module field was present, but we don't have it explicitly, we can group by extracting from action `module.action`)
  const permissions = await Permission.find();
  
  const grouped = permissions.reduce((acc, perm) => {
    const [moduleName] = perm.action.split('.');
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  return grouped;
};

export const PermissionService = {
  getPermissions,
};
