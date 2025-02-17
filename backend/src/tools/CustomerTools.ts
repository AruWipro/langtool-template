import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as customers from '../data/customer.json';

export class CustomerDetailsTool extends StructuredTool {
  name = "get_customer_details";
  description = "Get customer details based on name and mobile number.";
  schema = z.object({ customerName: z.string(), mobileNumber: z.string() }); // Input schema

  async _call({ customerName, mobileNumber }: z.infer<typeof this.schema>): Promise<any> {
    // Replace with your actual logic to fetch customer details
    const customer = customers.default.find(customer => customer.name === customerName && customer.phone === mobileNumber)
    if(!customer) {
        return {
            status: "failed",
            statuCode: 400,
            errorCode: "INVALID_CUSTOMER_DETAILS",
            description: `Customer with mobile nummber ${mobileNumber} and name ${customerName} not found`,
        };
    }
    return customer;;
  }
}


