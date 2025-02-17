import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { agents } from './agents.js';
import { WorkflowManager } from './index.js'; // Import your WorkflowManager

const app = express();
const port = process.env.PORT || 3232;

app.use(express.json()); // Enable parsing JSON request bodies

const workflowManager = new WorkflowManager(agents);

app.post('/api/run', async (req: any, res: any) => {
    const { message, id } = req.body; // Get the user's message from the request body

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    const threadId = id ?? uuidv4(); // Generate a unique thread ID

    try {
        
        const result = await workflowManager.runWorkflow(message, threadId); // Pass threadId to runWorkflow
        res.json({ threadId, result }); // Return thread ID and result
    } catch (error) {
        console.error("Error running workflow:", error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// app.get('/api/history/:threadId', async (req, res) => {
//     const threadId = req.params.threadId;

//     // Assuming your WorkflowManager has a method to get history
//     try {
//         const history = await workflowManager.getHistory(threadId); // Implement getHistory
//         res.json({ history });
//     } catch (error) {
//         res.status(500).json({ error: 'Could not retrieve history' });
//     }
// });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});