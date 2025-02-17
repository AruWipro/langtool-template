
import { MemorySaver } from "@langchain/langgraph"; // Import graph components
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { model } from "./model.js"; // Your LLM import
import { GetAccountBalanceTool, ListAccountsTool } from './tools/AccountsTools.js';
import { AddTool, DivideTool, MultiplyTool, SubtractTool } from './tools/ArthmeticTools.js';
import { BillerTool, PaymentTool, ValidateBillerTool } from './tools/BillPaymentTools.js';
import { CustomerDetailsTool } from './tools/CustomerTools.js';
const checkpointer = new MemorySaver();

export const agents = { // Same as before
    arithmeticAgent: {
        agent: createReactAgent({
            llm: model,
            tools: [new AddTool(), new SubtractTool(), new DivideTool(), new MultiplyTool()],
            name: 'arithmeticAgent',
            checkpointSaver: checkpointer,
            prompt: 'Indentify the right tool based on the input query',
            

        }),
        capabilities: ["Add", "Subtract", "Multiply", "Divide"],
    },
    factsAgent: {
        agent: createReactAgent({
            llm: model,
            tools:[],
            name: 'factTeller',
            checkpointSaver: checkpointer,
            prompt: 'Provide the latest know facts based on user input ',
        })
    },
    customerAgent: {
        agent: createReactAgent({
          llm: model,
          tools: [new CustomerDetailsTool()],
          name: 'customer',
          prompt: 'Always reterives customer details based on name and mobile number.',
        }),
        capabilities: ["GetCustomerDetails"],
      },
      billerAgent: {
        agent: createReactAgent({
          llm: model,
          tools: [new BillerTool(), new PaymentTool(), new ValidateBillerTool()],
          name: 'biller',
          prompt: 'Fetch billers, validate billers and amount, and process bill payments.',
        }),
        capabilities: ["FetchBillers", "PayBill", "ValidateBiller"],
      },
      accountsAgent: {
        agent: createReactAgent({
          llm: model,
          tools: [new ListAccountsTool(), new GetAccountBalanceTool()],
          name: 'accounts',
          prompt: 'Fetches account list and retrieve balances. Helps is accont related activities',
        }),
        capabilities: ["ListAccounts", "GetBalance"],
      },

};