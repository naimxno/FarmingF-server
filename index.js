const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId, ServerSession } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5ent.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("farming").collection("product");
    const purchaseCollection = client.db("farming").collection("purchase");
    const userCollection = client.db("farming").collection("users");

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
      res.send({ result, token });
    });

    app.put('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: ' admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role ? true : false;
      res.send({ admin: isAdmin })
    })

    app.get('/products', async (req, res) => {
      const query = {}
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products)
    });
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    app.get('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orderProduct = await productCollection.findOne(query);
      res.send(orderProduct)
    });
    app.post('/purchase', async (req, res) => {
      const purchase = req.body;
      const result = await purchaseCollection.insertOne(purchase);
      res.send(result);
    });

    app.get('/purchase', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const cursor = purchaseCollection.find(query);
      const purchases = await cursor.toArray();
      res.send(purchases)
    });

  }
  finally {
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})