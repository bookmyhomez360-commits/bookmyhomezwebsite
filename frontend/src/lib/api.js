import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

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

export const getCities = () => client.get("/cities").then((r) => r.data);
export const getCategories = () => client.get("/categories").then((r) => r.data);
export const getStats = () => client.get("/stats").then((r) => r.data);
export const getAgents = (city) =>
  client.get("/agents", { params: { city } }).then((r) => r.data);
export const getProperty = (id) => client.get(`/properties/${id}`).then((r) => r.data);
export const getProperties = (params) =>
  client.get("/properties", { params }).then((r) => r.data);
export const aiSearch = (query) =>
  client.post("/ai-search", { query }).then((r) => r.data);
export const createListing = (payload) =>
  client.post("/listings", payload).then((r) => r.data);

export default client;
