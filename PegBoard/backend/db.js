import { MongoClient } from "mongodb";
//import "regenerator-runtime/runtime";

// Student Number: u25245962

let client;
let db;
//let databasesList; for testing

async function connectDB() {
  const uri = process.env.MONGO_URI;
  client = new MongoClient(uri);

  // TODO: Connect to MongoDB
  await client.connect();

  //TODO:
  db = client.db("pegboard");
  console.log("connected to database");
}

// async function listDatabases(client){                                    --> for tesing
//     databasesList = await client.db().admin().listDatabases();

//     console.log("Databases:");
//     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
// };

function getDB() {
  // TODO: Return the database
  return db;
}

export { connectDB, getDB };
