import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { conflict, getPostgresError, unauthorized } from "../../errors.js";
import type { RegisterInput } from "./schemas.js";

export type UserRecord = typeof users.$inferSelect;

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  created_at: Date;
};

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    display_name: user.displayName,
    created_at: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    const [user] = await db
      .insert(users)
      .values({
        username: input.username,
        email: input.email,
        passwordHash,
        displayName: input.displayName ?? input.username,
      })
      .returning();

    return toPublicUser(user);
  } catch (err: any) {
    // Postgres unique violation on username or email. Drizzle exposes the
    // driver error on `cause`, so use the shared unwrapping helper.
    const pg = getPostgresError(err);
    if (pg?.code === "23505") {
      const field = pg.constraint?.includes("email")
        ? "Email"
        : pg.constraint?.includes("username")
          ? "Username"
          : "Username or email";
      throw conflict(`${field} already exists`);
    }
    throw err;
  }
}

export async function authenticateUser(email: string, password: string): Promise<PublicUser> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized("Invalid credentials");
  }
  return toPublicUser(user);
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  const user = await findUserById(id);
  return user ? toPublicUser(user) : null;
}
