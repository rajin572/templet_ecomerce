import { User } from '../user/user.model';
import { Role } from '../role/role.model';
import { Session } from '../session/session.model';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import { config } from '../../app/config';
import { QueryBuilder } from '../../utils/QueryBuilder';

const getAllStaff = async (query: Record<string, unknown>) => {
  // Find the 'user' or 'customer' role to exclude it
  const customerRole = await Role.findOne({ slug: 'user' });
  const excludeRoleId = customerRole ? customerRole._id : null;

  const filter: any = {};
  if (excludeRoleId) {
    filter.role = { $ne: excludeRoleId };
  }

  const staffQuery = new QueryBuilder(User.find(filter).populate('role'), query)
    .search(['name', 'email', 'phone'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await staffQuery.modelQuery;
  const meta = await staffQuery.countTotal();

  return { meta, data: result };
};

const createStaff = async (payload: any) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Find the role
  const role = await Role.findById(payload.role);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  if (!payload.password) {
    throw new ApiError(400, 'Password is required');
  }

  // Do not hash here — User.create triggers the pre('save') hook, which owns
  // password hashing. Hashing first would store a double hash and lock the
  // staff member out.
  const newStaff = await User.create({
    ...payload,
    emailVerified: true, // Assuming staff emails are verified upon creation
  });

  const staffObj = newStaff.toObject();
  delete staffObj.password;
  return staffObj;
};

const getStaffById = async (id: string) => {
  const staff = await User.findById(id).populate('role');
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }
  return staff;
};

const updateStaff = async (id: string, payload: any) => {
  const staff = await User.findById(id);
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }

  // findByIdAndUpdate bypasses the pre('save') hook, so this path must hash.
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, config.bcryptSaltRounds);
  }

  const result = await User.findByIdAndUpdate(id, payload, { new: true }).populate('role');
  return result;
};

const updateStaffStatus = async (id: string, status: string) => {
  const staff = await User.findById(id);
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }

  staff.status = status as any;
  await staff.save();
  return staff;
};

const updateStaffRole = async (id: string, roleId: string) => {
  const staff = await User.findById(id);
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  staff.role = role._id;
  await staff.save();
  return staff;
};

const forceLogout = async (id: string) => {
  const staff = await User.findById(id);
  if (!staff) {
    throw new ApiError(404, 'Staff not found');
  }

  await Session.deleteMany({ user: staff._id });
  return null;
};

export const StaffService = {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus,
  updateStaffRole,
  forceLogout,
};
