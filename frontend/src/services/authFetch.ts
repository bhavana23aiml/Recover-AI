import { supabase } from "../lib/supabase";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


export async function authenticatedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();


  if (error) {
    throw new Error(
      "Unable to read RecoverAI authentication session.",
    );
  }


  if (!session?.access_token) {
    throw new Error(
      "Authentication required.",
    );
  }


  const headers =
    new Headers(options.headers);


  headers.set(
    "Authorization",
    `Bearer ${session.access_token}`,
  );


  if (
    options.body &&
    !headers.has("Content-Type") &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }


  return fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  );
}


export async function authenticatedJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response =
    await authenticatedFetch(
      path,
      options,
    );


  if (!response.ok) {
    let detail =
      `Request failed with status ${response.status}.`;


    try {
      const body =
        await response.json();

      if (
        body &&
        typeof body.detail === "string"
      ) {
        detail =
          body.detail;
      }
    } catch {
      // Response was not JSON.
    }


    throw new Error(detail);
  }


  return response.json() as Promise<T>;
}