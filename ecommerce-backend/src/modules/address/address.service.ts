import { Address } from './address.model';
import { IAddress } from './address.interface';
import ApiError from '../../errors/ApiError';

const createAddress = async (userId: string, payload: Partial<IAddress>) => {
  // If this is the first address or isDefault is true, set others to not default
  const existingAddressesCount = await Address.countDocuments({ user: userId });
  
  if (payload.isDefault || existingAddressesCount === 0) {
    payload.isDefault = true;
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const result = await Address.create({ ...payload, user: userId });
  return result;
};

const getMyAddresses = async (userId: string) => {
  const result = await Address.find({ user: userId });
  return result;
};

const updateAddress = async (userId: string, addressId: string, payload: Partial<IAddress>) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (payload.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const result = await Address.findByIdAndUpdate(addressId, payload, { new: true });
  return result;
};

const deleteAddress = async (userId: string, addressId: string) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await Address.findByIdAndDelete(addressId);
  return null;
};

const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await Address.updateMany({ user: userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  return address;
};

export const AddressService = {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
