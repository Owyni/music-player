import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (
    typeof body.username !== "string" ||
    typeof body.password !== "string" ||
    !body.username.trim() ||
    !body.password
  ) {
    return Response.json({ error: "Usuario y contraseña son obligatorios." }, { status: 400 });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, body.username.trim()))
      .limit(1);

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return Response.json({ error: "Credenciales incorrectas." }, { status: 401 });
    }

    await createSession(user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Login failed:", error);
    return Response.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
