import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, withCredentials: true });

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const formatPrice = (price, unit) => {
  if (!price) return "Price on request";
  let val;
  if (price >= 10000000) val = `₹${(price / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  else if (price >= 100000) val = `₹${(price / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  else val = `₹${price.toLocaleString("en-IN")}`;
  if (unit === "month") return `${val}/mo`;
  if (unit === "night") return `${val}/night`;
  return val;
};

// media url helper (relative /api/media resolves via ingress on same domain)
export const mediaUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${BACKEND_URL}${url}`;
};

// public
export const getCities = () => client.get("/cities").then((r) => r.data);
export const getCategories = () => client.get("/categories").then((r) => r.data);
export const getStats = () => client.get("/stats").then((r) => r.data);
export const getAgents = (city) => client.get("/agents", { params: { city } }).then((r) => r.data);
export const getProperty = (id) => client.get(`/properties/${id}`).then((r) => r.data);
export const getProperties = (params) => client.get("/properties", { params }).then((r) => r.data);
export const aiSearch = (query) => client.post("/ai-search", { query }).then((r) => r.data);
export const createEnquiry = (id, payload) =>
  client.post(`/properties/${id}/enquiry`, payload).then((r) => r.data);

// auth
export const apiRegister = (payload) => client.post("/auth/register", payload).then((r) => r.data);
export const apiLogin = (payload) => client.post("/auth/login", payload).then((r) => r.data);
export const apiGoogleSession = (session_id) =>
  client.post("/auth/google/session", { session_id }).then((r) => r.data);
export const apiMe = () => client.get("/auth/me").then((r) => r.data);
export const apiLogout = () => client.post("/auth/logout").then((r) => r.data);

// listings (auth)
export const getMyProperties = () => client.get("/my/properties").then((r) => r.data);
export const getMyLeads = () => client.get("/my/leads").then((r) => r.data);
export const createProperty = (payload) => client.post("/properties", payload).then((r) => r.data);
export const updateProperty = (id, payload) =>
  client.put(`/properties/${id}`, payload).then((r) => r.data);
export const deleteProperty = (id) => client.delete(`/properties/${id}`).then((r) => r.data);

export const uploadMedia = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return client
    .post("/media", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((r) => r.data);
};

export default client;
