import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as billerData from '../data/billerDetails.json';

export class BillerTool extends StructuredTool {
    name = "fetch_billers";
    description = "Fetches billers associated with the customer.";
    schema = z.object({ customerId: z.string() });

    async _call({ customerId }: z.infer<typeof this.schema>): Promise<any> {
        const customerBillers = billerData.default.filter(biller => biller.customerId === customerId);
        return customerBillers;
    }
}

export class ValidateBillerTool extends StructuredTool {
    name = "validate_biller";
    description = "Validates the biller name for the given customer.";
    schema = z.object({ customerId: z.string(), billerName: z.string() });

    async _call({ customerId, billerName }: z.infer<typeof this.schema>): Promise<any> {
        const customerBillers = billerData.default.filter(biller => biller.customerId === customerId);
        const isValid = customerBillers.some(biller => biller.billerName === billerName);
        return { isValid };
    }
}

export class PaymentTool extends StructuredTool {
    name = "pay_bill";
    description = "Processes the bill payment.";
    schema = z.object({ customerId: z.string(), billerId: z.string(), amount: z.number() });

    async _call({ customerId, billerId, amount }: z.infer<typeof this.schema>): Promise<any> {
        const biller = billerData.default.find(b => b.billerId === billerId && b.customerId === customerId);

        if (!biller) {
            return {
                status: "failed",
                errorCode: "BILLER_NOT_FOUND",
                description: "Biller not found for this customer.",
            };
        } else if (amount < 10) {
            return {
                status: "failed",
                errorCode: "INVALID_AMOUNT",
                description: "Biller amount should be greater than 10r.",
            };
        }

        const accountNumber = biller.accountNumber;

        // Simulate payment processing (replace with your actual logic)
        const paymentSuccessful = Math.random() < 0.8; // 80% success rate for simulation

        if (paymentSuccessful) {
            return {
                status: "success",
                billerType: biller.billerType,
                billerName: biller.billerName,
                customerId: biller.customerId,
                accountNumber: accountNumber,
            };
        } else {
            return {
                status: "failed",
                errorCode: "PAYMENT_FAILED",
                description: "Payment processing failed.", // Or a more specific message
            };
        }
    }
}