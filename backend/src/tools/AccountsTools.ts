import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as accounts from '../data/accounts.json'; // Import your account data


let accountDetails = accounts.default;
export class ListAccountsTool extends StructuredTool {
    name = "list_accounts";
    description = "Get account details based on customerId.";
    schema = z.object({ customerId: z.string() });

    async _call({ customerId }: z.infer<typeof this.schema>): Promise<any> {
        const accounts = accountDetails.filter(account => account.customerId === customerId);
        return accounts;
    }
}

export class GetBalanceTool extends StructuredTool {
    name = "get_balance";
    description = "Retrieves balance based on accountId.";
    schema = z.object({ accountId: z.string() }); // Changed to accountId

    async _call({ accountId }: z.infer<typeof this.schema>): Promise<any> { // Changed to accountId
        const account = accountDetails.find(account => account.accountId === accountId);
        if (!account) {
            return {
                status: "failed",
                errorCode: "ACCOUNT_NOT_FOUND",
                description: "Account not found"
            }
        }
        return { balance: account.balance };
    }
}