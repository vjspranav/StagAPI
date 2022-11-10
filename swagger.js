const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Stag API", // by default: 'REST API'
    description: "API endpoints for StagOS Infrastructure", // by default: ''
  },
  host: "api.stag-os.org", // by default: 'localhost:3000'
  schemes: ["https"], // by default: ['http']
  securityDefinitions: {}, // by default: empty object
  definitions: {}, // by default: empty object (Swagger 2.0)
  components: {}, // by default: empty object (OpenAPI 3.x)
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as: index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);
