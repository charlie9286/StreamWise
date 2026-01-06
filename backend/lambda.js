// AWS Lambda handler for StreamWise API
// This file is the entry point for Lambda deployment

const serverless = require('serverless-http');
const app = require('./server');

// Export the handler for AWS Lambda
module.exports.handler = serverless(app);
