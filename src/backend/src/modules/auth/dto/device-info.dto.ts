import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
}

export class DeviceInfoDto {
  @ApiProperty({ description: 'Browser name' })
  @IsString()
  browser: string;

  @ApiProperty({ description: 'Browser version' })
  @IsString()
  browserVersion: string;

  @ApiProperty({ description: 'Operating system' })
  @IsString()
  os: string;

  @ApiProperty({ description: 'Operating system version' })
  @IsString()
  osVersion: string;

  @ApiProperty({ description: 'Device type', enum: DeviceType })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({ description: 'Whether the device is a bot' })
  @IsBoolean()
  isBot: boolean;
}

export class LocationInfoDto {
  @ApiProperty({ description: 'Country name', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'City name', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Region name', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'ISP name', required: false })
  @IsOptional()
  @IsString()
  isp?: string;
}

export class DeviceInfoResponseDto {
  @ApiProperty({ description: 'Device information', type: DeviceInfoDto, required: false })
  @IsOptional()
  device?: DeviceInfoDto;

  @ApiProperty({ description: 'Location information', type: LocationInfoDto, required: false })
  @IsOptional()
  location?: LocationInfoDto;

  @ApiProperty({ description: 'Client IP address', required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ description: 'User agent string', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Error message if any', required: false })
  @IsOptional()
  @IsString()
  error?: string;
}
