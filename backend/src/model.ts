import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { wrapSDK } from "langsmith/wrappers";
// Initialize Google GenAI model
const API_KEY = 'AIzaSyDHwSbTarmBfeJmYJCY_5GQ-7OSIsJzvB0'
const model = wrapSDK(new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  maxOutputTokens: 150,
  apiKey: API_KEY,
  verbose:true
}));

export { model };
