import { DataSource } from 'typeorm';
import { Roles } from '../entities/Roles';

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Roles);

  const roles = [
    { code: 'super_admin', display_name: 'supper admin' },
    { code: 'admin', display_name: 'admin' },
    { code: 'user', display_name: 'Người dùng' },
  ];

  for (const role of roles) {
    const existingRole = await roleRepository.findOne({
      where: { code: role.code },
    });
    if (!existingRole) {
      await roleRepository.save(role);
      console.log(`✅ Created role: ${role.code}`);
    } else {
      console.log(`⚠️ Role already exists: ${role.code}`);
    }
  }
};
