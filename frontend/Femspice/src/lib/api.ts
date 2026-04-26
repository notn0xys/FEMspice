export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://femspice-api.noxunya.dev";

export const apiUrl = (path: string) =>
  `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
