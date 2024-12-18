import Folder from "../models/Folder.js";
import User from "../models/User.js";

/**
 * Create a new folder for a user.
 * Validates the required data, creates a folder, associates it with the user,
 * and returns the created folder.
 *
 * @async
 * @function createFolder
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The user's ID.
 * @param {Object} req.body - The body of the request containing folder data.
 * @param {string} req.body.name - The name of the folder to create.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the newly created folder.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const createFolder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;

    // confirm data
    if (!name || !userId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // check if user exists
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // create new folder
    const folder = new Folder({
      user: userId,
      name,
      notes: [], // all created folders start empty
    });

    // store new folder
    const savedFolder = await folder.save();

    // add folder to user's folder arr
    user.folders.push(folder._id);
    await user.save();

    // send back new folder
    res.status(201).json(savedFolder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve all folders associated with a user.
 * Validates the user ID, fetches the user's folders, and returns the list.
 *
 * @async
 * @function getFolders
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The user's ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the list of folders.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const getFolders = async (req, res) => {
  try {
    const { userId } = req.params;

    // confirm data
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    // get list of folders from user
    const user = await User.findById(userId).populate("folders").exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // send back list of folders
    res.status(200).json(user.folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update the details of a folder.
 * Validates the folder ID and name, updates the folder, and returns the updated folder.
 *
 * @async
 * @function updateFolder
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.folderId - The folder's ID.
 * @param {Object} req.body - The body of the request containing updated data.
 * @param {string} req.body.name - The updated name of the folder.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the updated folder.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const updateFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    // confirm data
    if (!folderId || !name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // check if folder exists
    const folder = await Folder.findById(folderId).exec();
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // update folder
    folder.name = name;
    await folder.save();

    // send back the updated folder
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a folder.
 * Validates the folder ID, deletes the folder, and sends a success response.
 *
 * @async
 * @function deleteFolder
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.folderId - The folder's ID.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with a success status.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;

    // confirm data
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID required" });
    }

    // check if folder exists
    const folder = await Folder.findById(folderId).exec();
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // delete folder -- triggers pre-delete hook
    await folder.deleteOne();

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
