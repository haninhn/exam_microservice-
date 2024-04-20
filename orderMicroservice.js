const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the order.proto file
const orderProtoPath = 'order.proto';
try {
  const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const orderProto = grpc.loadPackageDefinition(orderProtoDefinition);

  // Implement the order service
  const orderService = {
    createOrder: (call, callback) => {
      // Logic to create an order
      const order = {
        id: '1',
        productId: call.request.productId,
        quantity: call.request.quantity,
        totalPrice: 100.00,
        status: 'created',
      };
      callback(null, { order });
    },
    getOrder: (call, callback) => {
      // Logic to get an order by ID
      const order = {
        id: call.request.id,
        productId: '1',
        quantity: 2,
        totalPrice: 100.00,
        status: 'created',
      };
      callback(null, { order });
    },
    // 
  };

  // Create and start the gRPC server for order service
  const server = new grpc.Server();
  server.addService(orderProto.OrderService.service, orderService);
  const port = 50053;
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
    console.log(`Server running on port ${port}`);
  });
  console.log(`Order microservice running on port ${port}`);
} catch (error) {
  console.error('Error loading order.proto:', error);
}
