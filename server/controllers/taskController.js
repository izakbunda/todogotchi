import Task from "../models/Task.js";
import Note from "../models/Note.js";

// points mapping -- refactor/change later
let pointsMapping = {
  easy: 250,
  medium: 500,
  hard: 1000,
};

/**
 * Create a new task associated with a specified note.
 *
 * @async
 * @function createTask
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.noteId - The ID of the note associated with the task.
 * @param {Object} req.body - The body of the request containing task data.
 * @param {string} req.body.name - The name of the task.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the newly created task.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const createTask = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { name } = req.body;

    // confirm required data
    if (!name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // check if note exists
    const note = await Note.findById(noteId).exec();
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // create new task
    const task = new Task({
      note: noteId,
      name,
      creationDate: Date.now(),
      status: "pending", // new tasks will always be pending
      category: "easy",
      points: pointsMapping["easy"],
    });

    console.log("created");

    // store the new task
    const savedTask = await task.save();

    console.log("saved");

    // add task to note's tasks arr
    note.tasks.push(task._id);
    await note.save();

    // send back new task
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve all tasks associated with a specified note.
 *
 * @async
 * @function getTasks
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.noteId - The ID of the note to retrieve tasks from.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the list of tasks.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const getTasks = async (req, res) => {
  try {
    const { noteId } = req.params;

    // confirm data
    if (!noteId) {
      return res.status(400).json({ message: "Note ID required" });
    }

    // get list of tasks from note
    const note = await Note.findById(noteId).populate("tasks").exec();

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // send back list of tasks
    res.status(200).json(note.tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a specific task's details.
 * Handles changes to category and updates points accordingly.
 *
 * @async
 * @function updateTask
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.taskId - The ID of the task to update.
 * @param {Object} req.body - The body of the request containing updates.
 * @param {string} [req.body.name] - The updated name of the task (optional).
 * @param {string} [req.body.status] - The updated status of the task (optional).
 * @param {string} [req.body.category] - The updated category of the task (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the updated task's details.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskData = req.body;

    // confirm required data
    if (!taskId) {
      return res.status(400).json({ message: "Task ID required" });
    }

    // TODO: need to check that update data is valid

    // check if task exists
    const oldTask = await Task.findById(taskId).exec();
    if (!oldTask) {
      res.status(404).json({ message: "Task not found" });
    }

    // if category changes, update points
    if (taskData.category && taskData.category !== oldTask.category) {
      taskData.points = pointsMapping[taskData.category];
    }

    // find task + update it
    const task = await Task.findByIdAndUpdate(taskId, taskData, {
      new: true,
    }).exec();

    // send back updated task
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a specific task by its ID.
 * Ensures the task exists and triggers pre-delete hooks if applicable.
 *
 * @async
 * @function deleteTask
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.taskId - The ID of the task to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response indicating success.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // confirm data
    if (!taskId) {
      return res.status(400).json({ message: "Task ID requireed" });
    }

    // check if task exists
    const task = await Task.findById(taskId).exec();
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // delete task -- triggers pre-delete hook
    await task.deleteOne();

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
