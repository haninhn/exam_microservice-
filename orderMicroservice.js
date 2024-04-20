const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql2/promise'); // Import MySQL client library



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


  // Create a MySQL connection pool
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'order',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Implement the order service
  /*const orderService = {
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
  };*/
  // Implement the order service
  const orderService = {
    createOrder: async (call, callback) => {
      try {
        // Get parameters from gRPC request
        const { productId, quantity } = call.request;

        // Insert order into MySQL database
        const connection = await pool.getConnection();
        const [result] = await connection.query('INSERT INTO orders (productId, quantity) VALUES (?, ?)', [productId, quantity]);
        connection.release();

        // Return the created order
        const order = {
          id: result.insertId,
          productId,
          quantity,
          totalPrice: 100.00,
          status: 'created',
        };
        callback(null, { order });
      } catch (error) {
        console.error('Error creating order:', error);
        callback(error);
      }
    },
    getOrder: async (call, callback) => {
      try {
        // Get the order ID from the gRPC request
        const orderId = call.request.id;

        // Fetch order details from MySQL database
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM orders WHERE productId = ?', [orderId]);
        connection.release();

        // Check if order exists
        if (rows.length === 0) {
          return callback({ code: grpc.status.NOT_FOUND, details: 'Order not found' });
        }

        // Return the fetched order
        const order = rows[0];
        callback(null, { order });
      } catch (error) {
        console.error('Error getting order:', error);
        callback(error);
      }
    },
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
