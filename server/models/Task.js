import mongoose from "mongoose";
import Note from "../models/Note.js";

/**
 * user is custom - view ./User.js
 */

const TaskSchema = new mongoose.Schema({
  // do we need this??
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  note: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    required: true,
  },

  name: { type: String, required: true },

  creationDate: { type: Date, default: Date.now },

  // make sure this is optional in controller
  dueDate: { type: Date },

  status: {
    type: String,
    enum: ["pending", "completed", "overdue"],
    default: "pending",
  },

  category: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },

  // make sure this is optional in controller
  completedDate: { type: Date },

  // mapping from category to points will be in controller
  points: { type: Number, default: 0 },
});

// pre-delete hook - removes task ref from note's tasks arr
TaskSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    console.log("removing task ref...");
    // remove task from note arr
    const note = await Note.findByIdAndUpdate(this.note, { $pull: { tasks: this._id } });
    console.log("new tasks array: ", note.tasks);

  next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model("Task", TaskSchema);

export default Task;
