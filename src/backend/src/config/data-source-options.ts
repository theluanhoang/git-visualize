import { DataSourceOptions } from 'typeorm';
import configuration from './configuration';

interface Paths {
  entities?: string[];
  migrations?: string[];
}

export const createDataSourceOptions = (paths: Paths = {}): DataSourceOptions => {
  const config = configuration();

  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    logging: config.database.logging,
    entities: paths.entities ?? ['dist/**/*.entity.js'],
    migrations: paths.migrations ?? ['dist/migrations/*.js'],
  };
};

