import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";


export class AddTool extends StructuredTool {
    name = "Add";
    description = "Adds two numbers.";
    schema = z.object({ a: z.number(), b: z.number() });
    async _call({ a, b }: { a: number; b: number }) { // Type annotations added
        return `AddTool result -- ${a + b}`;
    }
}

export class SubtractTool extends StructuredTool {
    name = "Subtract";
    description = "Subtracts two numbers.";
    schema = z.object({ a: z.number(), b: z.number() });
    async _call({ a, b }: { a: number; b: number }) { // Type annotations added
        return `SubtractTool result -- ${a - b}`;
    }
}

export class MultiplyTool extends StructuredTool {
    name = "Multiply";
    description = "Multiplies two numbers.";
    schema = z.object({ a: z.number(), b: z.number() });
    async _call({ a, b }: { a: number; b: number }) { // Type annotations added
        return `MultiplyTool result -- ${a * b}`;
    }
}

export class DivideTool extends StructuredTool {
    name = "Divide";
    description = "Divides two numbers.";
    schema = z.object({ a: z.number(), b: z.number() });
    async _call({ a, b }: { a: number; b: number }) { // Type annotations added
        if (b === 0) return "Error: Cannot divide by zero.";
        return `DivideTool result -- ${a / b}`;
    }
}
