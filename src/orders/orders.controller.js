const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// strictly middleware
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order ID not found: ${orderId}`,
  });
}

function orderIsValid(req, res, next) {
  const { data: order = {} } = req.body;
  if (!order.deliverTo || order.deliverTo.length == 0) {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }
  if (!order.mobileNumber || order.mobileNumber.length == 0) {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  if (!order.dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  }
  if (!Array.isArray(order.dishes) || order.dishes.length == 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  order.dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
}

function statusIsValid(req, res, next) {
  const { data: order = {} } = req.body;
  if (!order.status || order.status.length == 0) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
  if (order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  if (order.status === "invalid") {
    return next({
      status: 400,
      message: "status is invalid",
    });
  }
  next();
}

function statusIsPending(req, res, next) {
  const { data: order = {} } = req.body;
  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  next();
}

function orderIdMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: order = {} } = req.body;
  if (order.id && order.id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${order.id}, Route: ${orderId}`,
    });
  }
  next();
}

// CRUDL
function create(req, res) {
  const { data: order = {} } = req.body;
  const newOrder = {
    id: nextId(),
    ...order,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.json({
    data: res.locals.order,
  });
}

function update(req, res, next) {
  let order = res.locals.order;
  const { orderId } = req.params;
  const { data: newOrder = {} } = req.body;

  order = newOrder.id ? newOrder : { id: orderId, ...newOrder };

  res.json({ data: order });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  const deletedOrders = orders.splice(index, 1);
  res.sendStatus(204);
}

function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [orderIsValid, create],
  read: [orderExists, read],
  update: [orderExists, orderIsValid, statusIsValid, orderIdMatches, update],
  delete: [statusIsPending, orderExists, destroy],
  list,
};
