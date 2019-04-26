const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
  // graphql schema
  schema: graphQlSchema,
  // graphql resolver
  rootValue: graphQlResolvers,
  graphiql: true,
}))

mongoose
  .connect(`mongodb://localhost/react-graphql-booking`)
  .then(() => {
    app.listen(3000)
  })
  .catch((err) => {
    console.log(err)
  })