
import { match } from "../services/matchService.js";

export const startMatch = async (req, res) => {
  try {
    const { username } = req.body;

    const result = await match(username);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
