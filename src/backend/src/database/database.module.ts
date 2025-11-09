import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('database.host'),
        port: config.getOrThrow<number>('database.port'),
        username: config.getOrThrow<string>('database.username'),
        password: config.getOrThrow<string>('database.password'),
        database: config.getOrThrow<string>('database.database'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize') ?? false,
        logging: config.get<boolean>('database.logging'),
        extra: {
          max: parseInt(process.env.DB_POOL_SIZE || '50', 10),
          min: parseInt(process.env.DB_POOL_MIN || '5', 10),
          connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
          idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
        },
        // Keep snake_case naming if needed later via custom naming strategy
      }),
    }),
  ],
})
export class DatabaseModule {}


