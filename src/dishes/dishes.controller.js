const { url } = require("inspector");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// strictly middleware
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish ID not found: ${dishId}`,
  });
}

function dishIsValid(req, res, next) {
  const { data: dish = {} } = req.body;
  if (!dish.name || dish.name.length == 0) {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  if (!dish.description || dish.description.length == 0) {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }
  if (!dish.price) {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  }
  if (!Number.isInteger(dish.price) || dish.price <= 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!dish.image_url || dish.image_url.length == 0) {
    return next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }
  res.locals.dish = dish;
  next();
}

function dishIdMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: dish = {} } = req.body;
  if (dish.id && dish.id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`,
    });
  }
  next();
}

// CRUDL
function create(req, res) {
  const { data: dish = {} } = req.body;
  const newDish = {
    id: nextId(),
    ...dish,
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
  let dish = res.locals.dish;
  const { dishId } = req.params;
  const { data: newDish = {} } = req.body;

  dish =
    newDish.id && newDish.id.length > 0 && typeof newDish.id == "string"
      ? newDish
      : { id: dishId, ...newDish };

  res.json({ data: dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [dishIsValid, create],
  read: [dishExists, read],
  update: [dishExists, dishIsValid, dishIdMatches, update],
  list,
};
