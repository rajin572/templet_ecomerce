import express from 'express';
import { AddressController } from './address.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AddressValidation } from './address.validation';

const router = express.Router();

router.get('/', auth, AddressController.getMyAddresses);
router.post('/', auth, validateRequest(AddressValidation.createAddressSchema), AddressController.createAddress);
router.patch('/:id', auth, validateRequest(AddressValidation.updateAddressSchema), AddressController.updateAddress);
router.delete('/:id', auth, AddressController.deleteAddress);
router.patch('/:id/default', auth, AddressController.setDefaultAddress);

export const AddressRoutes = router;
