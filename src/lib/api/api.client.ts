import { deleteSessionToken, deleteStoredUser, getSessionToken } from "@/lib/storage/secure-storage";
import { create } from "axios";
import { notifyUnauthorized } from "./auth-events";

/**
 * Instancia centralizada de Axios para comunicarse con la API del instituto.
 */
export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api-gits.innovaweb.com.ar",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/**
 * INTERCEPTOR DE PETICIONES:
 * Antes de que salga cualquier solicitud HTTP, busca si hay un token de sesión
 * y lo inyecta en el header 'Authorization: Bearer <token>'.
 */
api.interceptors.request.use(async (config) => {
  const token = await getSessionToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * INTERCEPTOR DE RESPUESTAS:
 * 1. Si la respuesta es exitosa y viene envuelta en { success: true, data: ... },
 *    desempaqueta directamente 'data' para que los servicios reciban el objeto limpio.
 * 2. Si el servidor devuelve 401 Unauthorized (token vencido o inválido),
 *    borra las credenciales guardadas y avisa a la sesión para que vuelva al login.
 */
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      response.data = body.data; // Desempaqueta automáticamente la respuesta
    }
    return response;
  },
  async (error) => {
    // Token vencido o inválido (401): se borran los datos guardados y se avisa a la sesión,
    // que pasa a "sin usuario" y el guard de _layout.tsx lleva al login.
    // Se excluye /auth/login: ahí un 401 significa "email o contraseña incorrectos".
    const isLoginRequest = String(error.config?.url ?? "").includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      const hadSession = Boolean(await getSessionToken());
      await deleteSessionToken();
      await deleteStoredUser();
      if (hadSession) notifyUnauthorized(); // solo si había sesión (evita avisos repetidos)
    }
    // Formatea los mensajes de error devueltos por el backend
    const message = error.response?.data?.message;
    if (message) {
      error.message = Array.isArray(message) ? message.join(", ") : message;
    }
    return Promise.reject(error);
  },
);
