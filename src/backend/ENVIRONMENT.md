Environment variables

Copy the following into a `.env` file in `backend/`:

```
# Application
PORT=8000
GLOBAL_PREFIX=api
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Swagger
SWAGGER_ENABLED=true
SWAGGER_PATH=docs
SWAGGER_TITLE=Visualized Git API
SWAGGER_DESCRIPTION=API documentation
SWAGGER_VERSION=1.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=postgres

# TypeORM
TYPEORM_LOGGING=false
TYPEORM_SYNCHRONIZE=false

# Auth (JWT)
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=14d

# OAuth Providers
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/v1/auth/oauth/github/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
FACEBOOK_CALLBACK_URL=http://localhost:8000/api/v1/auth/oauth/facebook/callback
```

## OAuth Setup Instructions

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs: `http://localhost:8000/api/v1/auth/oauth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:8000/api/v1/auth/oauth/github/callback`
4. Copy Client ID and Client Secret to your `.env` file

### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:8000/api/v1/auth/oauth/facebook/callback`
5. Copy App ID and App Secret to your `.env` file


