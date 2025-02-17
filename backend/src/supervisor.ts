import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import { z } from "zod";
import { agents } from './agents.js';
import { model } from "./model.js";


export class Supervisor {
  private members: readonly string[];
  private systemPrompt: string;
  private options: readonly string[];
  private prompt: ChatPromptTemplate;
  private llm: any; // Type should be more specific if possible (e.g., BaseLLM)

  constructor() {
    this.members = Object.keys(agents);
    this.systemPrompt =
      "You are a supervisor tasked with managing a conversation between the" +
      " following workers: {members}. Given the following user request," +
      " respond with the worker to act next. Each worker will perform a" +
      " task and respond with their results and status. When finished," +
      " respond with FINISH.";
    this.options = [END, ...this.members];
    this.llm = model; // Initialize the LLM

    this.prompt = ChatPromptTemplate.fromMessages([
      ["system", this.systemPrompt],
      new MessagesPlaceholder("messages"),
      [
        "human",
        "Do not fabricate data. Strictly use data provided by user" +
        "If there is no data in the input provided return FINISH " +
        "When you are calling same agent back to back ensure if there is change in the data, else try with next relevant agent or return FINISH if no relevant agent is found.",
      ],
     
      [
        "human",
        "Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}",
      ],
    ]);
  }

  public async initializePrompt():Promise<ChatPromptTemplate> { // Make this method to initialize the prompt
    return await this.prompt.partial({
        options: this.options.join(", "),
        members: this.members.join(", "),
      });
  }

  async getSupervisorChain() {
    const formattedPrompt = await this.initializePrompt(); // Call initializePrompt

    const routingTool = {
      name: "route",
      description: "Select the next role.",
      schema: z.object({
        next: z.enum([END, ...this.members]),
      }),
    };

    return formattedPrompt
      .pipe(this.llm.bindTools(
        [routingTool],
        {
          tool_choice: "route",
        },
      ))
      .pipe((x: any) => (x?.tool_calls[0].args));
  }
}

// Example usage:
async function main() {
  const supervisor = new Supervisor();
  const supervisorChain = await supervisor.getSupervisorChain(); // Get the chain

  // You can now use supervisorChain:
  const result = await supervisorChain.invoke({ messages: [] }); // Example invocation
  console.log(result);
}



export default Supervisor; // Export the class