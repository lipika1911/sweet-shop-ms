import mongoose from "mongoose";
import Sweet from "../models/Sweet.js";

export const createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity,
    });

    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.status(200).json(sweets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query = {};

    // search by name (partial, case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // search by category
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // search by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });

    res.status(200).json(sweets);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid sweet ID" });
    }

    const updatedSweet = await Sweet.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    res.status(200).json(updatedSweet);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


