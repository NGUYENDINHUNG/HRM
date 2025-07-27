export const appConfig = () => ({
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE,
    refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  },

  db: {
    uri: process.env.DB_URI,
  },
});
