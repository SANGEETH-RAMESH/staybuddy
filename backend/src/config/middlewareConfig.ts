export const JWT_EXPIRY = "1h"

export const REFRESH_TOKEN_EXPIRY = "7d"

export const JWT_SECRET = process.env.JWT_SECRET || 'these_is_my_secret_key'

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'these_is_refresh_token_secret' 