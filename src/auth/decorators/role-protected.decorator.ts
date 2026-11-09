import { SetMetadata } from '@nestjs/common';
import { META_ROLES } from '../constants/roles';
import { ValidRoles } from '../interfaces';

export const RoleProtected = (...args: ValidRoles[]) => {

  return SetMetadata(META_ROLES, args)
};
