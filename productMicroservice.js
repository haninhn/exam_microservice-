// productMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the product.proto file
const productProtoPath = 'product.proto';
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition);
const productService = productProto.ProductService;

// Implement the product service
const serviceImpl = {
  createProduct: (call, callback) => {
    // Logic to create a product
    const product = {
      id: '1',
      name: call.request.name,
      price: call.request.price,
      description: call.request.description,
    };
    callback(null, { product });
  },
  getProduct: (call, callback) => {
    // Logic to get a product by ID
    const product = {
      id: call.request.id,
      name: 'Example Product',
      price: 10.99,
      description: 'This is an example product.',
    };
    callback(null, { product });
  },
  getProducts: (call, callback) => {
    // Logic to fetch all products
    const products = [
      { id: '1', name: 'Product 1', price: 19.99, description: 'Description of Product 1' },
      { id: '2', name: 'Product 2', price: 29.99, description: 'Description of Product 2' },
      // Add more products as needed
    ];
    callback(null, { products });
  },
};

// Create and start the gRPC server for product service
const server = new grpc.Server();
server.addService(productService.service, serviceImpl);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server running on port ${port}`);
});
console.log(`Product microservice running on port ${port}`);
