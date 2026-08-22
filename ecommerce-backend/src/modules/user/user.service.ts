import { User } from './user.model';
import ApiError from '../../errors/ApiError';

const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate('role');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const updateMe = async (userId: string, payload: { name?: string; phone?: string; avatar?: string }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const result = await User.findByIdAndUpdate(userId, payload, { new: true }).populate('role');
  return result;
};

export const UserService = {
  getMe,
  updateMe,
};
