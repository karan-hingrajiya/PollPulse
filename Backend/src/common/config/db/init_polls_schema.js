import { getDB } from "./connection.js";

const initPollsDb = async () => {
  const db = getDB();

  const existCollection = await db.listCollections({ name: "polls" }).toArray();

  if (existCollection.length === 0) {
    await db.createCollection("polls", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "createdBy", "questions"],
          properties: {
            title: {
              bsonType: "string",
              minLength: 2,
              maxLength: 300,
            },
            description: {
              bsonType: "string",
              minLength: 10,
              maxLength: 1000,
            },
            createdBy: {
              bsonType: "objectId",
            },
            createdAt: {
              bsonType: "date",
            },
            expiresAt: {
              bsonType: "date",
            },
            publishedAt: {
              bsonType: "date",
            },
            isPublished: {
              //is result of the poll published or not
              bsonType: "bool",
            },
            isAnonymous: {
              bsonType: "bool",
            },
            shareToken: {
              bsonType: "string",
            },
            questions: {
              bsonType: "array",
              minItems: 1,
              items: {
                //items is used to define childeren in mongodb raw mongo drivers we cant define [] to define array.
                bsonType: "object",
                required: ["text", "options"],
                properties: {
                  _id: { bsonType: "objectId" },
                  text: {
                    bsonType: "string",
                    minLength: 6,
                    maxLength: 1000,
                  },
                  isMandatory: { bsonType: "bool" },
                  options: {
                    bsonType: "array",
                    minItems: 2,
                    items: {
                      bsonType: "object",
                      required: ["text"],
                      properties: {
                        _id: { bsonType: "objectId" },
                        text: {
                          bsonType: "string",
                          minLength: 2,
                          maxLength: 1000,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  await db.collection("polls").createIndex({ createdBy: 1, createdAt: -1 });
  await db
    .collection("polls")
    .createIndex(
      { shareToken: 1 },
      { unique: true, sparse: true, name: "uq_polls_shareToken" },
    );
  await db.collection("polls").createIndex({ expiresAt: 1 });

  console.log("DB init for polls table completed!!!");
};

export default initPollsDb;
