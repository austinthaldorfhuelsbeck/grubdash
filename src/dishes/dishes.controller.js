const { url } = require("inspector");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// strictly middleware
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === Number(dishId));
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish ID not found: ${dishId}`,
  });
}

function dishIdMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { newDish } = {} } = req.body;
  if (newDish.id && newDish.id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  next();
}

// CRUDL
function create(req, res, next) {
  const { data: { dishData } = {} } = req.body;
  const newDish = {
    id: nextId,
    dishData,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({
    data: res.locals.dish,
  });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: { newDish } = {} } = req.body;
  dish = newDish;
  res.json({ data: dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create,
  read: [dishExists, read],
  update: [dishIdMatches, update],
  list,
};
