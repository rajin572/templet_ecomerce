import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/modules/user/user.model';
import { Role } from '../src/modules/role/role.model';
import { Permission } from '../src/modules/permission/permission.model';
import { PERMISSIONS } from '../src/constants/permissions';
import { ROLES } from '../src/constants/roles';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not defined');

    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB for seeding...');

    // Delete existing standard permissions and roles
    await Permission.deleteMany({});

    const permissionDocs = Object.entries(PERMISSIONS).map(([key, action]) => ({
      name: key.replace(/_/g, ' ').toLowerCase(),
      action,
      description: `Permission for ${action}`,
    }));

    const createdPermissions = await Permission.insertMany(permissionDocs);
    console.log('Permissions seeded.');

    const rolesToCreate = [
      { name: 'Super Admin', slug: ROLES.SUPER_ADMIN, isSystem: true },
      { name: 'Admin', slug: ROLES.ADMIN, isSystem: true },
      { name: 'Manager', slug: ROLES.MANAGER, isSystem: true },
      { name: 'Staff', slug: ROLES.STAFF, isSystem: true },
      { name: 'User', slug: ROLES.USER, isSystem: true },
      // Sub-manager roles
      { name: 'Order Manager', slug: 'order_manager', isSystem: true },
      { name: 'Inventory Manager', slug: 'inventory_manager', isSystem: true },
      { name: 'Accountant', slug: 'accountant', isSystem: true },
      { name: 'Marketing Manager', slug: 'marketing_manager', isSystem: true },
      { name: 'Customer Support', slug: 'customer_support', isSystem: true },
      { name: 'Delivery Manager', slug: 'delivery_manager', isSystem: true },
      { name: 'Content Manager', slug: 'content_manager', isSystem: true },
    ];

    for (const roleData of rolesToCreate) {
      let perms: mongoose.Types.ObjectId[] = [];

      // Assign permissions based on role
      if (roleData.slug === ROLES.SUPER_ADMIN || roleData.slug === ROLES.ADMIN) {
        perms = createdPermissions.map(p => p._id);
      } else if (roleData.slug === ROLES.USER) {
        perms = [];
      } else if (roleData.slug === 'order_manager') {
        perms = createdPermissions.filter(p => p.action.startsWith('order.')).map(p => p._id);
      } else if (roleData.slug === 'inventory_manager') {
        perms = createdPermissions.filter(p => p.action.startsWith('inventory.')).map(p => p._id);
      } else {
        // Just generic permissions or empty for now
        perms = [];
      }

      await Role.findOneAndUpdate(
        { slug: roleData.slug },
        { ...roleData, permissions: perms },
        { upsert: true, new: true }
      );
    }
    console.log('Roles seeded.');

    // Seed Super Admin User
    const superAdminRole = await Role.findOne({ slug: ROLES.SUPER_ADMIN });
    if (superAdminRole) {
      const superAdminEmail = 'superadmin@ECommerce.com';
      const existingSuperAdmin = await User.findOne({ email: superAdminEmail });

      if (!existingSuperAdmin) {
        // Plaintext — the User pre('save') hook hashes it.
        await User.create({
          name: 'Super Admin',
          email: superAdminEmail,
          phone: '00000000000',
          password: 'ECommerce@2026',
          role: superAdminRole._id,
          status: 'active',
          emailVerified: true,
          phoneVerified: true,
        });
        console.log('Super Admin created (superadmin@ECommerce.com / ECommerce@2026).');
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
