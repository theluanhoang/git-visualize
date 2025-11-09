import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { DeviceTrackingService } from '../auth/device-tracking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
  ],
  controllers: [SessionController],
  providers: [SessionService, DeviceTrackingService],
  exports: [SessionService],
})
export class SessionModule {}
