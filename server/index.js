const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient(process.env.MONGO_CONNECTION);
client.connect().then(() => console.log("connected to db"));

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/searchone", async (req, res) => {
  try {
    if (req.query.city) {
      let results;
      if (req.query.city.includes(",") || req.query.city.includes(" ")) {
        results = await client
          .db("location")
          .collection("cities")
          .aggregate([
            {
              $search: {
                index: "autocomplete",
                autocomplete: {
                  query: req.query.city,
                  path: "searchName",
                  fuzzy: {
                    maxEdits: 1,
                  },
                  tokenOrder: "sequential",
                },
              },
            },
            {
              $project: {
                searchName: 1,
                _id: 1,
                city: 1,
                country: 1,
                adminCode: 1,
                countryCode: 1,
                fullName: 1,
                score: { $meta: "searchScore" },
              },
            },
            {
              $limit: 10,
            },
          ])
          .toArray();

        return res.send(results);
      }

      result = await client
        .db("location")
        .collection("cities")
        .aggregate([
          {
            $search: {
              index: "autocomplete",
              autocomplete: {
                query: req.query.city,
                path: "city",
                fuzzy: {
                  maxEdits: 1,
                },
                tokenOrder: "sequential",
              },
            },
          },
          {
            $project: {
              searchName: 1,
              _id: 1,
              city: 1,
              country: 1,
              adminCode: 1,
              countryCode: 1,
              fullName: 1,
              score: { $meta: "searchScore" },
            },
          },
          {
            $limit: 10,
          },
        ])
        .toArray();

      return res.send(result);
    }
    res.send([]);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

app.get("/searchtwo", async (req, res) => {
  try {
    if (req.query.city) {
      let results;
      if (req.query.city.includes(",") || req.query.city.includes(" ")) {
          results = await client
            .db("location")
            .collection("cities")
            .aggregate([
              {
                $search: {
                  index: "default",
                  compound: {
                    must: [
                      {
                        text: {
                          query: req.query.city,
                          path: "searchName",
                          fuzzy: {
                            maxEdits: 1,
                          },
                        },
                      },
                    ],
                  },
                },
              },
              {
                $limit: 10,
              },
              {
                $project: {
                  searchName: 1,
                  _id: 1,
                  city: 1,
                  country: 1,
                  adminCode: 1,
                  countryCode: 1,
                  fullName: 1,
                  score: { $meta: "searchScore" },
                },
              },
            ])
            .toArray();
            
          return res.send(results);
      }

       results = await client
         .db("location")
         .collection("cities")
         .aggregate([
           {
             $search: {
               index: "default",
               compound: {
                 must: [
                   {
                     text: {
                       query: req.query.city,
                       path: "city",
                       fuzzy: {
                         maxEdits: 1,
                       },
                     },
                   },
                 ],
               },
             },
           },
           {
             $limit: 10,
           },
           {
             $project: {
               searchName: 1,
               _id: 1,
               city: 1,
               country: 1,
               adminCode: 1,
               countryCode: 1,
               fullName: 1,
               score: { $meta: "searchScore" },
             },
           },
         ])
         .toArray();

       return res.send(results);
    }
    res.send([]);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});

app.get("/", async (req, res) => {
  let result = await client
    .db("location")
    .collection("cities")
    .findOne({ countryCode: "AE" });

  res.send(result);
});

app.listen(4000, console.log("listening on 4000"));
