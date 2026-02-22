const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));

mongoose.connect("mongodb://127.0.0.1:27017/bakeryDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number
}));

//  GRAPHQL SCHEMA 
const schema = buildSchema(`
  type Product {
    id: ID
    name: String
    price: Int
    category: String
    stock: Int
  }

  type Query {
    products: [Product]
    product(id: ID!): Product
  }

  type Mutation {
    addProduct(name: String!, price: Int!, category: String!, stock: Int!): Product
    updateProduct(id: ID!, name: String, price: Int, category: String, stock: Int): Product
    deleteProduct(id: ID!): Product
  }
`);

//  RESOLVERS 
const root = {
  products: () => Product.find(),
  product: ({ id }) => Product.findById(id),

  addProduct: ({ name, price, category, stock }) => {
    const product = new Product({ name, price, category, stock });
    return product.save();
  },

  updateProduct: ({ id, name, price, category, stock }) =>
    Product.findByIdAndUpdate(
      id,
      { $set: { name, price, category, stock } },
      { new: true }
    ),

  deleteProduct: ({ id }) => Product.findByIdAndDelete(id)
};

// GRAPHQL ENDPOINT 
app.use("/graphql", graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}));

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000/graphql");
});
