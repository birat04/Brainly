/** Cookie names — safe for Edge middleware (no Node/Mongo imports). */
export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";
/** Legacy client-set cookie — cleared when issuing new sessions. */
export const LEGACY_TOKEN_COOKIE = "token";

export const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
