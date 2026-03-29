import { db } from "../db";
import { tenants } from "../db/schema";

export const createTenant = async (payload: {
  name: string;
  businessType: "coffee_shop" | "fashion" | "laundry" | "restoran" | "bakery";
  domain?: string;
}) => {
  try {
    await db.insert(tenants).values({
      name: payload.name,
      businessType: payload.businessType,
      domain: payload.domain,
    });
    
    return "OK";
  } catch (error) {
    throw new Error("error");
  }
};
