import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Determine if we're in development or production
const isDev = import.meta.env.DEV;

// Helper function to read JSON files
const readFile = async (filename: string) => {
  try {
    let filePath;
    
    // In development, use the source directory
    if (isDev) {
      filePath = path.join(DATA_DIR, filename);
    } 
    // In production (build), use the public directory
    else {
      // For static build, we need to fetch from the public directory
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Helper function to write JSON files
const writeFile = async (filename: string, data: any) => {
  try {
    // In production (static build), we can't write files, so just log the data
    if (!isDev) {
      console.log(`Would write to ${filename}:`, data);
      return true;
    }
    
    // In development, write to the source directory
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// Data Store API
export const getProducts = async () => {
  return await readFile('products.json');
};

export const getProductBySlug = async (slug: string) => {
  const data = await getProducts();
  if (!data) return null;
  
  return data.products.find((product: any) => product.slug === slug);
};

export const addProduct = async (product: any) => {
  const data = await getProducts();
  if (!data) return false;
  
  data.products.push(product);
  return await writeFile('products.json', data);
};

export const updateProduct = async (id: string, updates: any) => {
  const data = await getProducts();
  if (!data) return false;
  
  const index = data.products.findIndex((product: any) => product.id === id);
  if (index === -1) return false;
  
  data.products[index] = { ...data.products[index], ...updates, updatedAt: new Date().toISOString() };
  return await writeFile('products.json', data);
};

export const deleteProduct = async (id: string) => {
  const data = await getProducts();
  if (!data) return false;
  
  data.products = data.products.filter((product: any) => product.id !== id);
  return await writeFile('products.json', data);
};

export const getOrders = async () => {
  return await readFile('orders.json');
};

export const getOrderById = async (id: string) => {
  const data = await getOrders();
  if (!data) return null;
  
  return data.orders.find((order: any) => order.id === id);
};

export const addOrder = async (order: any) => {
  const data = await getOrders();
  if (!data) return false;
  
  const orderNumber = data.nextOrderNumber || 1001;
  const newOrder = {
    ...order,
    id: `order-${Date.now()}`,
    orderNumber: orderNumber.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.orders.push(newOrder);
  data.nextOrderNumber = orderNumber + 1;
  
  const success = await writeFile('orders.json', data);
  return success ? newOrder : false;
};

export const updateOrder = async (id: string, updates: any) => {
  const data = await getOrders();
  if (!data) return false;
  
  const index = data.orders.findIndex((order: any) => order.id === id);
  if (index === -1) return false;
  
  data.orders[index] = { ...data.orders[index], ...updates, updatedAt: new Date().toISOString() };
  return await writeFile('orders.json', data);
};

export const getDeliverySettings = async () => {
  return await readFile('delivery-settings.json');
};

export const updateDeliveryRegion = async (id: string, updates: any) => {
  const data = await getDeliverySettings();
  if (!data) return false;
  
  const index = data.regions.findIndex((region: any) => region.id === id);
  if (index === -1) return false;
  
  data.regions[index] = { ...data.regions[index], ...updates, updatedAt: new Date().toISOString() };
  return await writeFile('delivery-settings.json', data);
};

export const checkDeliveryAvailability = async (pincode: string) => {
  const data = await getDeliverySettings();
  if (!data) return { available: false, charge: 0, days: 0, region: null };
  
  const pincodeNum = parseInt(pincode);
  
  // Check if pincode is in any of the regions
  for (const region of data.regions) {
    if (!region.isEnabled) continue;
    
    const start = parseInt(region.pincodeStart);
    const end = parseInt(region.pincodeEnd);
    
    if (pincodeNum >= start && pincodeNum <= end) {
      return {
        available: true,
        charge: region.deliveryCharge,
        days: region.estimatedDays,
        region
      };
    }
  }
  
  // If no region matches, check if we can deliver based on default settings
  const defaultRegions = data.regions.filter((r: any) => r.regionName.includes('Default'));
  if (defaultRegions.length > 0) {
    const defaultRegion = defaultRegions[0];
    return {
      available: defaultRegion.isEnabled,
      charge: defaultRegion.deliveryCharge,
      days: defaultRegion.estimatedDays,
      region: defaultRegion
    };
  }
  
  return { available: false, charge: 0, days: 0, region: null };
};

export const getSettings = async () => {
  return await readFile('settings.json');
};

export const updateSettings = async (updates: any) => {
  const data = await getSettings();
  if (!data) return false;
  
  const updated = { ...data, ...updates };
  return await writeFile('settings.json', updated);
};

export const getAdmins = async () => {
  return await readFile('admins.json');
};

export const getAdminByUsername = async (username: string) => {
  const data = await getAdmins();
  if (!data) return null;
  
  return data.admins.find((admin: any) => admin.username === username);
};

export const addAdmin = async (admin: any) => {
  const data = await getAdmins();
  if (!data) return false;
  
  // Check if admin with same username already exists
  if (data.admins.some((a: any) => a.username === admin.username)) {
    return false;
  }
  
  const newAdmin = {
    ...admin,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  data.admins.push(newAdmin);
  return await writeFile('admins.json', data);
};