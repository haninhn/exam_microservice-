// apiGateway.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const resolvers = require('./resolvers'); // Import  resolvers
const typeDefs = require('./schema'); // Import  GraphQL schema

// Create a new Express application
const app = express();
app.use(bodyParser.json());

// Load the proto files for the product and order microservices
const productProtoPath = 'product.proto';
const orderProtoPath = 'order.proto';
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition);
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition);

// Create an ApolloServer instance with the imported schema and resolvers
const server = new ApolloServer({ typeDefs, resolvers });

// Apply the ApolloServer middleware to the Express application
server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

// Define the gRPC endpoints for the product microservice
app.get('/products', (req, res) => {
  const client = new productProto.ProductService('localhost:50052', grpc.credentials.createInsecure());
  client.getProducts({}, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.products);
    }
  });
});

app.get('/products/:id', (req, res) => {
  const client = new productProto.ProductService('localhost:50052', grpc.credentials.createInsecure());
  const id = req.params.id;
  client.getProduct({ id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.product);
    }
  });
});
// Define the gRPC endpoint for creating a product
app.post('/products', (req, res) => {
  const client = new productProto.ProductService('localhost:50052', grpc.credentials.createInsecure());
  const { name, price, description } = req.body; // Assuming the request body contains the product details
  client.createProduct({ name, price, description }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.product);
    }
  });
});
// Define the gRPC endpoints for the order microservice
app.post('/orders', (req, res) => {
  const client = new orderProto.OrderService('localhost:50053', grpc.credentials.createInsecure());
  const { productId, quantity } = req.body; // Assuming the request body contains the order details
  client.createOrder({ productId, quantity }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.order);
    }
  });
});


app.get('/orders/:id', (req, res) => {
  const client = new orderProto.OrderService('localhost:50053', grpc.credentials.createInsecure());
  const id = req.params.id;
  client.getOrder({ id }, (err, response) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(response.order);
    }
  });
});

// Start the Express application
const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
