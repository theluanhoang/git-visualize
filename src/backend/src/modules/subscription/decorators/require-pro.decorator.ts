import { SetMetadata } from '@nestjs/common';
import { REQUIRE_PRO_KEY } from '../guards/pro-subscription.guard';

export const RequirePro = () => SetMetadata(REQUIRE_PRO_KEY, true);













