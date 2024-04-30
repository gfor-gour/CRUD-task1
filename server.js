const express = require('express');
const bodyParser = require('body-parser');
const file_sys = require('fs/promises'); 


const app = express();
const PORT = 9000;
const task_files = 'tasks.json';

app.use(bodyParser.json());


let my_tasks = [];

async function loadTasks() {
    try {
        const data = await file_sys.readFile(task_files);
        my_tasks = JSON.parse(data);
    } catch (err) {
        console.error('Error loading tasks:', err);
    }
}


async function saveTasks() {
    try {
        await file_sys.writeFile(task_files, JSON.stringify(my_tasks, null, 2));
    } catch (err) {
        console.error('Error saving tasks:', err);
    }
}

// loading the tasks;
loadTasks();

app.post('/tasks', async (req, res) => {
    const { title, description, status } = req.body;
    if (title === undefined || title === null || status === undefined 
        || status === null || description == null || description == undefined) {
        return res.status(400).json({ error: 'Please,Provide Title,Status,Description' });
    }

    const id = my_tasks.length + 1;
    const newTask = { id, title, description, status };
    my_tasks.push(newTask);

    await saveTasks(); 
    res.status(200).json(newTask);
});

app.put('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { title, description, status } = req.body;
    const taskIndex = my_tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    my_tasks[taskIndex] = { ...my_tasks[taskIndex], title, description, status};
    await saveTasks(); 
    res.json(my_tasks[taskIndex]);
});


app.get('/tasks', (req, res) => {
    res.json(my_tasks);
});


app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = my_tasks.find(task => task.id === taskId);
    if (!task) {
        return res.status(404).json({ error: 'Data not available.' });
    }
    res.json(task);
});

app.delete('/tasks/:id', async (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = my_tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }
    
    my_tasks.splice(taskIndex, 1);
    await saveTasks(); 
    res.sendStatus(204);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});