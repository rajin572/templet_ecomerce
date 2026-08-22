import { IRole } from './role.interface';
import { Role } from './role.model';
import ApiError from '../../errors/ApiError';
import { slugify } from '../../utils/slugify';

const createRole = async (payload: Partial<IRole>) => {
  const slug = slugify(payload.name as string);
  const existingRole = await Role.findOne({ slug });
  if (existingRole) {
    throw new ApiError(400, 'Role with this name already exists');
  }

  const result = await Role.create({ ...payload, slug });
  return result;
};

const getRoles = async () => {
  const result = await Role.find().populate('permissions');
  return result;
};

const getRoleById = async (id: string) => {
  const result = await Role.findById(id).populate('permissions');
  if (!result) {
    throw new ApiError(404, 'Role not found');
  }
  return result;
};

const updateRole = async (id: string, payload: Partial<IRole>) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  // Spec: system roles are undeletable, not unmodifiable — their permission set
  // must stay editable or the permission matrix cannot manage any seeded role.
  // Their identity is fixed, though, and super_admin implicitly holds everything.
  if (role.isSystem) {
    if (role.slug === 'super_admin') {
      throw new ApiError(403, 'The super admin role cannot be modified');
    }
    if (payload.name || payload.slug) {
      throw new ApiError(403, 'System roles cannot be renamed');
    }
    delete payload.isSystem;
  }

  if (payload.name) {
    payload.slug = slugify(payload.name);
  }

  const result = await Role.findByIdAndUpdate(id, payload, {
    new: true,
  }).populate('permissions');
  return result;
};

const deleteRole = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }
  if (role.isSystem) {
    throw new ApiError(403, 'System roles cannot be deleted');
  }

  await Role.findByIdAndDelete(id);
  return null;
};

export const RoleService = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
