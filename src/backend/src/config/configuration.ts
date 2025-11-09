export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '8000', 10),
    globalPrefix: process.env.GLOBAL_PREFIX ?? 'api',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  swagger: {
    enabled: (process.env.SWAGGER_ENABLED ?? 'true') === 'true',
    path: process.env.SWAGGER_PATH ?? 'docs',
    title: process.env.SWAGGER_TITLE ?? 'Visualized Git API',
    description: process.env.SWAGGER_DESCRIPTION ?? 'API documentation',
    version: process.env.SWAGGER_VERSION ?? '1.0',
  },
  database: {
    type: 'postgres' as const,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'admin',
    password: process.env.DB_PASSWORD ?? 'admin',
    database: process.env.DB_NAME ?? 'postgres',
    logging: (process.env.TYPEORM_LOGGING ?? 'false') === 'true',
    synchronize: (process.env.TYPEORM_SYNCHRONIZE ?? 'false') === 'true',
    migrationsRun: (process.env.TYPEORM_MIGRATIONS_RUN ?? 'false') === 'true',
  },
  auth: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '14d',
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:8000/api/v1/auth/oauth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:8000/api/v1/auth/oauth/github/callback',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL ?? 'http://localhost:8000/api/v1/auth/oauth/facebook/callback',
    },
  },
  mail: {
    host: process.env.MAIL_HOST ?? '',
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    secure: (process.env.MAIL_SECURE ?? 'false') === 'true',
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER ?? '',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  },
});


