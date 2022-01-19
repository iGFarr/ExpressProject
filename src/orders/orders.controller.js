const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res, next){
    res.json({ data: orders })
}

function orderExists(req, res, next){
    const { orderId } = req.params;

    const { data: { id } = {}} = req.body;

    const foundOrder = orders.find((order) => order.id === orderId);

    if(!foundOrder){
        next({
            status: 404, message: `Order id: ${orderId} does not exist`
        })
    }
    if(id && id !== orderId){
        next({
            status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
          })
    }
    res.locals.order = foundOrder;
    next();
}

function bodyIsValid(req, res, next){
    const { data: { status, deliverTo, mobileNumber, dishes } = {} } = req.body;
    
      if(!deliverTo || deliverTo === ""){
          return next({
              status: 400, message: `Order must include a deliverTo`,
          })
      }
      if(!mobileNumber || mobileNumber === ""){
          return next({
              status: 400, message: `Order must include a mobileNumber`,
          })
      }
      if(!dishes){
          return next({
              status: 400, message: `Order must include a dish`,
          })
      }
      if(!Array.isArray(dishes)  || !dishes.length){
          return next({
              status: 400, message: `Order must include at least one dish`,
          })
      }
      if(dishes.some((dish) => !dish.quantity || typeof dish.quantity !== 'number')){
          const index = dishes.findIndex((dish) => !dish.quantity || typeof dish.quantity !== 'number');
          return next({
              status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`,
          })
      }
    next()
  }
  
  function create(req, res, next){
      const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
     
      const newOrder = {
          id: nextId(),
          deliverTo,
          mobileNumber,
          dishes,
      }
      orders.push(newOrder)
      res.status(201).json({  data: newOrder })
  }


  function read(req, res, next){
      res.json({ data: res.locals.order })
  }

  function update(req, res, next){
      const order = res.locals.order;
      const originalDeliverTo = order.deliverTo;
      const originalMobileNumber = order.mobileNumber;
      const originalStatus = order.status;
      const originalDishes = order.dishes;

      const { data: { deliverTo, mobileNumber, status, dishes }} = req.body;
    
      if(!status || status.length === 0 || status === "invalid"){
        return next({
            status: 400, message: `Order must include a status`,
        })
      }

      if(originalDeliverTo !== deliverTo){
        order.deliverTo = deliverTo;
      }
      if(originalMobileNumber !== mobileNumber){
        order.mobileNumber = mobileNumber;
      }
      if(originalStatus !== status){
        order.status = status;
      }
      if(originalDishes !== dishes){
        order.dishes = dishes;
    }
    res.json({ data: order })
  }

  function destroy(req, res, next){
      const { orderId } = req.params;
      const index = orders.findIndex((order) => order.id === Number(orderId));

      const { status } = res.locals.order;
    
      if(status !== "pending"){
           return next({
            status: 400, message: `An order cannot be deleted unless it is pending`,
        })
      }
      const deletedOrders = orders.splice(index, 1);
      res.sendStatus(204);
  }
  
module.exports = {
    list,
    create: [bodyIsValid, create],
    read: [orderExists, read],
    update: [orderExists, bodyIsValid, update],
    delete: [orderExists, destroy],
}