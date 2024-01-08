const express = require("express");
const router = express.Router();
const knex = require("../db/connection");

router.get("/", async (req, res, next) => {
  try {
    const theaters = await knex("theaters").select("*");

    const theatersWithMovies = await Promise.all(
      theaters.map(async (theater) => {
        const movies = await knex("movies")
          .join(
            "movies_theaters",
            "movies.movie_id",
            "=",
            "movies_theaters.movie_id"
          )
          .where("movies_theaters.theater_id", theater.theater_id)
          .select("movies.*");

        return {
          ...theater,
          movies: movies,
        };
      })
    );

    res.json({ data: theatersWithMovies });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
