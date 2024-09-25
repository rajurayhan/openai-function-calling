// index.js

const readline = require('readline');
const { addTask, listTasks, updateTask } = require('./database');
require('dotenv').config();

// Import the OpenAI package
const OpenAI = require('openai');

// Configure the OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Setup command-line interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define functions for AI to call
async function handleAICommand(userInput) {
    const functions = [
        {
            name: 'addTask',
            description: 'Add a new task to the task list',
            parameters: {
                type: 'object',
                properties: {
                    description: { type: 'string', description: 'The task description' }
                },
                required: ['description']
            }
        },
        {
            name: 'listTasks',
            description: 'List all tasks from the task list',
            parameters: {}
        },
        {
            name: 'updateTask',
            description: 'Update the status of a task',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'integer', description: 'The task ID' },
                    status: { type: 'string', description: 'The new status (e.g., completed, pending)' }
                },
                required: ['id', 'status']
            }
        }
    ];

    // Send request to OpenAI with function calling enabled
    const response = await openai.chat.completions.create({
        model: 'gpt-4-0613',
        messages: [
            { role: 'system', content: 'You are an AI assistant helping manage tasks.' },
            { role: 'user', content: userInput }
        ],
        functions: functions,
        function_call: 'auto'  // Let the AI decide whether to call a function
    });

    const message = response.choices[0].message;

    // Handle function calls
    if (message.function_call) {
        const { name, arguments } = message.function_call;
        const args = JSON.parse(arguments);
        if (name === 'addTask') {
            const task = await addTask(args.description);
            console.log("Task added:", task);
        } else if (name === 'listTasks') {
            const tasks = await listTasks();
            console.log("Tasks:");
            tasks.forEach((task) => {
                console.log(`${task.id}: ${task.description} [${task.status}]`);
            });
        } else if (name === 'updateTask') {
            const updatedTask = await updateTask(args.id, args.status);
            console.log("Task updated:", updatedTask);
        }
    } else {
        console.log("AI Response:", message.content);
    }

    promptUser();  // Re-prompt the user after handling the AI response
}

// Prompt user for input
function promptUser() {
    rl.question("", (userInput) => {
        handleAICommand(userInput);
    });
}

console.log("Welcome to the AI-powered Task Tracker!, How can I assist you with your tasks?");
promptUser();
