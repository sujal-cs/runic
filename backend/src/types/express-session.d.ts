import "express-session";

// Augment the session type so route code can read `req.session.userId`
// without casting. The value is the UUID of the signed-in user.
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}
