import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { traceable } from "langsmith/traceable";
import { v4 as uuidv4 } from 'uuid';
import { agents } from './agents.js';
import { Supervisor } from "./supervisor.js";

export class WorkflowManager {
  private supervisor: Supervisor;
  private graph: any; // The compiled graph
  private agents: any
  constructor(agents: { arithmeticAgent: any; factsAgent: any; }) {
    this.supervisor = new Supervisor();
    this.agents = agents
  }

  async initializeGraph() {
    const chain = await this.supervisor.getSupervisorChain();

    const AgentState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
      }),

      customerDetails: Annotation<any | null>({ // Store customer details
        reducer: (_, y) => y,
        default: () => null,
    }),

      next: Annotation<string>({
        reducer: (x, y) => y ?? x ?? END,
        default: () => END,
      }),
    });

    // Utility function to extract data and update state
    const facttellerNode = async (
      state: typeof AgentState.State,
      config?: RunnableConfig,
    ) => {
      const result = await agents.factsAgent.agent.invoke(state, config); // Directly use agents.factTeller
      
      const lastMessage = result.messages[result.messages.length - 1];
      return {
        messages: [
          new HumanMessage({ content: lastMessage.content, name: "human" }),
        ],
      };
    };
  
    const arithmeticNode = async (
      state: typeof AgentState.State,
      config?: RunnableConfig,
    ) => {
      const result = await agents.arithmeticAgent.agent.invoke(state, config); // Directly use agents.calculator
      const lastMessage = result.messages[result.messages.length - 1];
      return {
        messages: [
          new HumanMessage({ content: lastMessage.content, name: "human" }),
        ],
      };
    };
  
      const billerNode = async (
      state: typeof AgentState.State,
      config?: RunnableConfig,
    ) => {
      const result = await agents.billerAgent.agent.invoke(state, config); // Directly use agents.billerAgent
      const lastMessage = result.messages[result.messages.length - 1];
      return {
        messages: [
          new AIMessage({ content: lastMessage.content }),
        ],
      };
    };
  
      const customerNode = async (
      state: typeof AgentState.State,
      config?: RunnableConfig,
    ) => {
      const result = await agents.customerAgent.agent.invoke(state, config); // Directly use agents.customerAgent
      const lastMessage = result.messages[result.messages.length - 1];
      return {
        messages: [
          new AIMessage({ content: lastMessage.content}),
        ]
      };
    };
  
      const accountNode = async (
      state: typeof AgentState.State,
      config?: RunnableConfig,
    ) => {
      const result = await agents.accountsAgent.agent.invoke(state, config); // Directly use agents.accountsAgent
      const lastMessage = result.messages[result.messages.length - 1];
      return {
        messages: [
          new HumanMessage({ content: lastMessage.content, name: "human" }),
        ],
      };
    };
  
  
    const workflow = new StateGraph(AgentState)
      .addNode("arithmeticAgent", arithmeticNode)
      .addNode("fact_teller", facttellerNode)
      .addNode("billerAgent", billerNode)
      .addNode("customerAgent", customerNode)
      .addNode("accountsAgent", accountNode)
      .addNode("supervisor", chain)
      .addEdge("arithmeticAgent", "supervisor")
      .addEdge("fact_teller", "supervisor")
      .addEdge("billerAgent", "supervisor")
      .addEdge("customerAgent", "supervisor")
      .addEdge("accountsAgent", "supervisor")
      .addConditionalEdges(
        "supervisor",
        (x: typeof AgentState.State) => x.next
      )
      .addEdge(START, "supervisor");
  
    this.graph = workflow.compile();
  }

  


    public runWorkflow = traceable(async (initialMessage: string) => {
      if (!this.graph) {
        await this.initializeGraph(); // Initialize if not already done
      }

      console.log(`---Graph---`);
      const config: RunnableConfig = {  // Create RunnableConfig here
        configurable: {
          thread_id: uuidv4(), // Generate a unique ID for this run
        },
        // ... other configuration options if needed
      };
      let streamResults = this.graph.stream(
        {
          messages: [
            new HumanMessage({
              content: initialMessage,
            }),
          ],
        },
        { recursionLimit: 10, ...config },
      );

      for await (const output of await streamResults) {
        if (!output?.__end__) {
          console.log(output);
          console.log("----");
        }
      }
    })
}


// Example usage:
// async function main() {
//   const workflowManager = new WorkflowManager(agents); // Pass agents to the constructor
//   // (await workflowManager.runWorkflow("What were the 3 most popular tv shows in 2023?"));

//   // You can call runWorkflow multiple times with different messages
//   await workflowManager.runWorkflow("I am Jane Smith and My mobileNumber is 987-654-3210, i want to pay my electricity bill");
// }

// main();