import User from "../models/userModel.js";

export const createUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    // Check if user already exists
    let existing = await User.findOne({ username });
    if (existing) {
      return res.json({ message: "user_exists", user: existing });
    }

    // Create new user
    const user = await User.create({ username, level: 1 });

    res.json({ message: "user_created", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
