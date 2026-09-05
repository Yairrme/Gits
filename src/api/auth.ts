import * as SecureStore from "expo-secure-store";
import { api } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginPayload) {
  const { data: responseData } = await api.post("/auth/login", { email, password });
  
  // La API envuelve la respuesta en "data" según el DTO (ApiSuccessEnvelopeDto)
  const result = responseData.data || responseData;
  const token = result.accessToken || result.access_token;

  if (token) {
    await SecureStore.setItemAsync("token", token);
  }

  return {
    access_token: token,
    user: result.user
  };
}

export async function logout() {
  await SecureStore.deleteItemAsync("token");
}
