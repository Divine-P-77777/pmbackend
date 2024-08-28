const crypto = require('crypto');

// Generates a 256-bit (32-byte) random key
const secretKey = crypto.randomBytes(32).toString('hex');

console.log("Your generated secret key:", secretKey);
// 377481b805db153dc95bd8ece4783124e0757288111b7a6650ffca41454fb5ba