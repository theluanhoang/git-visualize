import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { createDataSourceOptions } from './src/config/data-source-options';

export default new DataSource(createDataSourceOptions());


