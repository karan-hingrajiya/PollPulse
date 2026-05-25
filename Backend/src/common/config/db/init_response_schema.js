import { getDB } from "./connection.js";

const initResponseDB = async () => {
  const db = getDB();

  const existCollection = await db
    .listCollections({ name: "responses" })
    .toArray();

  if (existCollection.length === 0) {
    await db.createCollection("responses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["pollId", "answers", "fingerprint"],
          properties: {
            respondentId: {
              bsonType: ["objectId", "null"], // null if no response
            },
            submittedAt: {
              bsonType: "date",
            },
            pollId: {
              bsonType: "objectId",
            },
            fingerprint: {
              bsonType: "string",
              maxLength: 100,
            },
            answers: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["questionId", "selectedOptionId"],
                properties: {
                  _id: { bsonType: "objectId" },
                  questionId: { bsonType: "objectId" }, //ref to poll table in question
                  selectedOptionId: { bsonType: ["objectId", "null"] }, //its temporary only for one option selection if we need to add multiple options selection then need to define array which we can do in future
                },
              },
            },
          },
        },
      },
    });
  }

  await db.collection("responses").createIndex({ pollId: 1, submittedAt: -1 });
  await db.collection("responses").createIndex({ respondentId: 1 });

  // Unique index to prevent race conditions for authenticated users
  await db.collection("responses").createIndex(
    { pollId: 1, respondentId: 1 },
    {
      unique: true,
      partialFilterExpression: { respondentId: { $type: "objectId" } },
    },
  );

  // Unique index to prevent race conditions for device fingerprints
  await db.collection("responses").createIndex(
    { pollId: 1, fingerprint: 1 },
    {
      unique: true,
    },
  );

  console.log("DB init for response table completed!!!");
};

export default initResponseDB;
