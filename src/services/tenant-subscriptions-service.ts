import { db } from "../db";
import { tenantSubscriptions } from "../db/schema";

export const createSubscription = async (payload: {
  tenant_id: number;
  package_id: number;
  start_date: string | Date;
  end_date: string | Date;
}) => {
  try {
    // Ensure dates are Date objects if passed as strings
    const startDate = typeof payload.start_date === 'string' ? new Date(payload.start_date) : payload.start_date;
    const endDate = typeof payload.end_date === 'string' ? new Date(payload.end_date) : payload.end_date;

    await db.insert(tenantSubscriptions).values({
      tenant_id: payload.tenant_id,
      package_id: payload.package_id,
      start_date: startDate,
      end_date: endDate,
      status: "active",
    });
    
    return "OK";
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("error");
  }
};
