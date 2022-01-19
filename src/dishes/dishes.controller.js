const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res, next){
    res.json({ data: dishes })
}

function dishIdExists(req, res, next){
    const { dishId } = req.params;
  
    const { data: { id } = {}} = req.body;
    
    const dish = dishes.find((dish) => dish.id === dishId)
    if(!dish){
        next({
            status: 404, message: `Dish does not exist: ${dishId}`
        })
    }
    if(id && id !== dishId){
        next({
          status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        })
    }    
    res.locals.dish = dish;
    next();
}

function bodyIsValid(req, res, next){
  const { data: { name, description, price, image_url } = {} } = req.body;
    if(!name || name === ""){
        return next({
            status: 400, message: `Dish must include a name`,
        })
    }
    if(!description || description === ""){
        return next({
            status: 400, message: `Dish must include a description`,
        })
    }
    if(!price){
        return next({
            status: 400, message: `Dish must include a price`,
        })
    }
    if(typeof price !== "number" || price <= 0){
        return next({
            status: 400, message: `Dish must have a price that is an integer greater than 0`,
        })
    }
    if(!image_url || image_url === ""){
        return next({
            status: 400, message: `Dish must include an image_url`,
        })
    }
  next()
}

function create(req, res, next){
    const { data: { name, description, price, image_url } = {} } = req.body;
   
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish)
    res.status(201).json({  data: newDish })
}

function read(req, res, next){
    res.json({ data: res.locals.dish })
}

function update(req, res, next){

  const dish = res.locals.dish;
  const originalId = dish.id;
  const originalName = dish.name;
  const originalDescription = dish.description;
  const originalImageUrl = dish.image_url;
  const originalPrice = dish.price;
  
  const { data: { name, description, image_url, price } = {}} = req.body;
  if(originalName !== name){
    dish.name = name;
  }
  if(originalDescription !== description){
    dish.description = description;
  }
  if(originalImageUrl !== image_url){
    dish.image_url = image_url;
  }
  if(originalPrice !== price){
    dish.price = price;
}
  res.json({ data: dish });
}

module.exports = {
    list,
    create: [bodyIsValid, create],
    read: [dishIdExists, read],
    update: [dishIdExists, bodyIsValid, update],
}
