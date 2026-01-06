// Vercel serverless function entry point
// Change to backend directory to resolve relative paths correctly
process.chdir(__dirname + '/../backend');
const app = require('./server.js');
module.exports = app;
