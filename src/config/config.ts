export default () => ({
    mongodbUri: process.env.MONGODB_URI,
    secretAccessToken: process.env.SECRET_ACCESS_TOKEN,
    accessTokenExpiry: parseInt(process.env.ACCESS_TOKEN_EXPIRY!, 10) || 900,
    secretRefreshToken: process.env.SECRET_REFRESH_TOKEN,
    refreshTokenExpiry: parseInt(process.env.REFRESH_TOKEN_EXPIRY!, 10) || 604800,
    resetSecret: process.env.RESET_SECRET,
    resetTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY!, 10) || 3600,

});