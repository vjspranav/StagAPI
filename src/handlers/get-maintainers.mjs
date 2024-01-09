// Create clients and set shared const values outside of the handler.
import { MongoClient } from "mongodb";

const MONGOURI = process.env.MONGOURI;
const VERSION = process.env.VERSION;
const client = new MongoClient(MONGOURI);

export const getMaintainersHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const device = event.pathParameters.device;

  // All log statements are written to CloudWatch
  console.info("received:", event);

  try {
    // Get all items from the Maintainers table
    const db = await client.db("StagOfficial");
    const collection = await db.collection("maintainers");
    const body = await collection.findOne({
      device_codename: device,
      version: VERSION,
      status: "Accepted"
    });
    console.info("maintainers", body);
    const response = {
      statusCode: 200,
      body: JSON.stringify(body),
    };

    // All log statements are written to CloudWatch
    console.info(
      `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );
    return response;
  } catch (err) {
    console.log("Error", err);
  }
};
