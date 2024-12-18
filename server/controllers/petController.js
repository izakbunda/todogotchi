import Pet from "../models/Pet.js";
import User from "../models/User.js";

/**
 * Create a new pet for a specified user.
 * This action should only occur once per account.
 *
 * @async
 * @function createPet
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user creating the pet.
 * @param {Object} req.body - The body of the request containing pet data.
 * @param {string} req.body.name - The name of the pet.
 * @param {string} req.body.type - The type of the pet.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the newly created pet.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const createPet = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, type } = req.body;

    // confirm data
    if (!userId || !name || !type) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // create new pet
    const pet = new Pet({
      user: userId,
      name,
      type,
    });

    // store new pet
    const savedPet = await pet.save();

    // add pet to user's pet arr
    user.pets.push(pet._id);
    await user.save();

    // send back new pet
    res.status(201).json(savedPet);

    console.log("success");
  } catch (error) {
    // console.log("error");
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve a specific pet by its ID.
 * Validates the pet ID and returns the pet's details.
 *
 * @async
 * @function getPet
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.petId - The ID of the pet to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the pet's details.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const getPet = async (req, res) => {
  try {
    const { petId } = req.params;

    // confirm data
    if (!petId) {
      return res.status(400).json({ message: "Pet ID required" });
    }

    // get pet
    const pet = await Pet.findById(petId).exec();
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // send back pet
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update the details of a specific pet.
 * This method handles general updates as well as specific updates for the pet's points and level.
 *
 * @async
 * @function updatePet
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.petId - The ID of the pet to update.
 * @param {Object} req.body - The body of the request containing updates.
 * @param {number} [req.body.points] - The points to add or subtract, triggering potential level changes.
 * @param {string} [req.body.name] - The updated name of the pet (optional).
 * @param {string} [req.body.type] - The updated type of the pet (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the updated pet's details.
 * @throws {Object} Sends a JSON response with appropriate error messages.
 */
export const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const updates = req.body; // Allow any fields to be passed for updating

    // Confirm required data
    if (!petId) {
      return res.status(400).json({ message: "Pet ID required" });
    }

    // Fetch the pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    // If points are included in the update, calculate new level and experience
    if (updates.points !== undefined) {
      const BASE_EXP = 100;
      const EXPONENT = 1.5;
      const calculateRequiredExp = (level) =>
        BASE_EXP * Math.pow(level, EXPONENT);

      let totalExp = pet.points + updates.points; // Add or subtract points
      let newLevel = pet.level;
      let maxExp = calculateRequiredExp(newLevel);

      // Handle level-up
      while (totalExp >= maxExp) {
        totalExp -= maxExp;
        newLevel += 1;
        maxExp = calculateRequiredExp(newLevel);
      }

      // Handle level-down
      while (totalExp < 0 && newLevel > 1) {
        newLevel -= 1;
        maxExp = calculateRequiredExp(newLevel);
        totalExp += maxExp;
      }

      // Update points and level
      pet.points = totalExp;
      pet.level = newLevel;
    }

    // Apply other updates (e.g., name, type)
    for (const key in updates) {
      if (key !== "points") {
        pet[key] = updates[key];
      }
    }

    // Save updated pet
    const updatedPet = await pet.save();

    // Send back updated pet
    res.status(200).json(updatedPet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
