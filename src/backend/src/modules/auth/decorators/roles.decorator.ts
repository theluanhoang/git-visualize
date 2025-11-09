import { SetMetadata } from '@nestjs/common';
import { EUserRole } from '../../users/user.interface';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);

export const ForAdmin = () => Roles(EUserRole.ADMIN);


