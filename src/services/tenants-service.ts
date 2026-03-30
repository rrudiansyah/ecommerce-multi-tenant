import { db } from "../db";
import { tenants } from "../db/schema";

export const createTenant = async (payload: {
  name: string;
  business_type: "coffee_shop" | "fashion" | "laundry" | "restoran" | "bakery";
  domain?: string;
}) => {
  try {
    await db.insert(tenants).values({
      name: payload.name,
      business_type: payload.business_type,
      domain: payload.domain,
    });
    
    return "OK";
  } catch (error) {
    throw new Error("error");
  }
};

export const getTenants = async () => {
  return await db.query.tenants.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
};
