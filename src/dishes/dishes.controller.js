const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function create(req, res, next) {
  const { data: { dish } = {} } = req.body;
  const newDish = {
    id: nextId,
    dish,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
