import { db } from "../db";
import { packages } from "../db/schema";

export const createPackage = async (payload: {
  name: string;
  price?: string; // decimal is usually string in JS
  duration_days: number;
  max_users?: number;
  max_products?: number;
}) => {
  try {
    await db.insert(packages).values({
      name: payload.name,
      price: payload.price,
      duration_days: payload.duration_days,
      max_users: payload.max_users,
      max_products: payload.max_products,
    });
    
    return "OK";
  } catch (error) {
    console.error("Error creating package:", error);
    throw new Error("error");
  }
};
