Walmart Test
===

## Objective
This test consist in create an WebService to a Walmart's client discover the best path for delivery your products. The WebService must have a way to manage an map with the routes available. The routes available have the following properties `origin`, `destination` and `cost` in KM. WebService need have a way to calculate the best path based in the following properties `origin`, `destination`, `autonomy`of the vehicle and `gas` price.  

## Tools
- **Node.js** - A JavaScript platform.
- **Hapi** - Web framework
- **MongoDB** - NoSQL Database
- **Lab** - BDD and Code Coverage framework
- **Chai** - Assertion library

## The right tool for the right job
Today, **Node.js** is an huge platform for web development, this is endorsed by a lot of big companies like Netflix, LinkedIn, Microsoft, Paypal, Medium, Uber and **Walmart**. The facility in development and the power of the V8 contribute for an fast product for production ready!  

**Hapi** have a lot of tools and your archteture is designed to empower the developer when we need to build an API. Your community support and ecosystem envolved encourage us to use this to make great APIs.  

In this case we not have a lot of relations and our data is simple, so is better keep it simple, **MongoDB** help us in this case, A NoSQL document based database is a perfect Database for this project.  

All software have bugs, but we can decrease the risks writting automated tests. 

When we use **Hapi**, **Lab** fits like a glove. This have inside your code some features embedded like Code Coverage, Linters and others stuffs for help us to improve our source. Finally **Chai** help us in the tests when we need do an assertion in and variable or objects received.

## The API
Our API have an unique endpoint called `map`, following the endpoint documentation.

### GET /maps
**Overview**: GET /maps will return all maps stored  
**request**
```
GET /maps
```
**output**
```json
[
  {
    "_id": "561dc3c1e2f5436f6e6e4981",
    "name": "SP",
    "__v": 0,
    "roads": [
      {
        "origin": "A",
        "destination": "B",
        "cost": 10,
        "_id": "561dc3c1e2f5436f6e6e4982"
      }
    ]
  }
]
```

### GET /map/{id}
**Overview**: GET /map/{id} will return just one specified map.  
**Parameters**:
- **id** - Must be an MongoDB ObjectID - Id is required.

**request**  
```
GET /map/561dc3c1e2f5436f6e6e4981
```
**output**
```json
{
  "_id": "561dc3c1e2f5436f6e6e4981",
  "name": "SP",
  "__v": 0,
  "roads": [
    {
      "origin": "A",
      "destination": "B",
      "cost": 10,
      "_id": "561dc3c1e2f5436f6e6e4982"
    }
  ]
}
```

### GET /map/{id}/route
**Overview**: GET /map/{id}/route will return the best route for the parameters sended. If a route is not available or invalid parameters, an `statusCode=400` will received.  
**Parameters**: All parameters are required.
- **origin** - The start point in this map.
- **destination** - The end point in this map.
- **autonomy** - The autonomy of the vehicle in KM. (How many KM the vehicle can run with one liter of gas)
- **gas** - The price of the gasoline

**request**  
```
GET /map/561ffd80497f0c09812d3180/route?origin=Barretos&destination=Viradouro&autonomy=10&gas=3.45
```  
**output**
```json
{
  "path": [
    "Barretos",
    "Jaborandi",
    "Terra Roxa",
    "Viradouro"
  ],
  "cost": 19.665
}
```

### POST /map
**Overview**: POST /map will create a new map in the database.   
**Parameters**: All parameters are required.
- **name** - A name for this new map.
- **roads** - Roads is an Array of the roads available in the map including the distance between two points.  
    * **origin** - A name of a start point.
    * **destination** - A name of a end point.
    * **cost** - The distance between this two points.

**request**  
```
POST /map { "name": "Barretos", "roads": [ {"origin": "Barretos", "destination": "Jaborandi", "cost": 10} ] } 
```
**output**
```json
{
  "_id": "561dc3c1e2f5436f6e6e4981",
  "name": "SP",
  "__v": 0,
  "roads": [
    {
      "origin": "A",
      "destination": "B",
      "cost": 10,
      "_id": "561dc3c1e2f5436f6e6e4982"
    }
  ]
}
```

### PUT /map/{id}
**Overview**: PUT /map will update a specified map in the database.   
**Parameters**: 
- **id** - The id of the document for update. (*Query string param*)
- **name** - A name for this new map.
- **roads** - Roads is an Array of the roads available in the map including the distance between two points.  
    * **origin** - A name of a start point.
    * **destination** - A name of a end point.
    * **cost** - The distance between this two points.

**request**  
```
PUT /map/561dc3c1e2f5436f6e6e4981 { "name": "Barretos" } 
```
**output**
```json
{
  "_id": "561dc3c1e2f5436f6e6e4981",
  "name": "Barretos",
  "__v": 0,
  "roads": [
    {
      "origin": "A",
      "destination": "B",
      "cost": 10,
      "_id": "561dc3c1e2f5436f6e6e4982"
    }
  ]
}
```

### DELETE /map/{id}
**Overview**: DELETE /map will delete a specified map in the database.   
**Parameters**: All parameters are required.
- **id** - The id of the document for update. (*Query string param*)
- 
**request**  
```
POST /map/fadfgadgfadsgdfgsdfgs { "name": "Barretos" } 
```
**output**
```json

````

## Best route 
Well, to fit the best route, I use the Dijkstra Algorithm, because this algorithm can help us to resolve this question. 
When we get the map and transform it in a Graph, we can calculate the best path for the start point to the goal. After find the path, we have the cost of this path, Dijkstra will get ever the best fit, so we need to calculate the cost based in the autonomy and the price of gas.  
**formula**: (`cost` * `gas`) / `autonomy`  
`cost` is the value returned by Dijkstra algorithm.

### Others Approches
To solve this problem we can fit the search in width or depth common used in the AI to solve problems.

## Run this Project
To run this project you need have installed 
- Node.js (latest version)
- MongoDB 3.0.6

And then just run
```sh
npm run build && npm start
```
