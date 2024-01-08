const express = require("express");
const cors = require("cors");
const notFound = require("./errors/notFound");
const errorHandler = require("./errors/errorHandler");
const methodNotAllowed = require("./errors/methodNotAllowed");

const moviesRouter = require("./routes/movies");
const theatersRouter = require("./routes/theaters");
const reviewsRouter = require("./routes/reviews");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/movies", moviesRouter);
app.use("/theaters", theatersRouter);
app.use("/reviews", reviewsRouter);

app.use(notFound);
app.use(methodNotAllowed);
app.use(errorHandler);

module.exports = app;
