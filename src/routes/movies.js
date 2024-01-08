const express = require("express");
const router = express.Router();
const knex = require("../db/connection");

router.get("/:movieId", async (req, res, next) => {
  const { movieId } = req.params;

  try {
    const movie = await knex("movies").where({ movie_id: movieId }).first();

    if (!movie) {
      return res.status(404).json({ error: "Movie cannot be found." });
    }

    res.json({ data: movie });
  } catch (error) {
    console.error("Error in /movies/:movieId route:", error);

    console.error(error.stack);

    next(error);
  }
});

router.get("/:movieId/theaters", async (req, res, next) => {
  const { movieId } = req.params;

  try {
    const theaters = await knex("theaters")
      .join(
        "movies_theaters",
        "theaters.theater_id",
        "=",
        "movies_theaters.theater_id"
      )
      .where("movies_theaters.movie_id", movieId)
      .select("theaters.*");

    res.json({ data: theaters });
  } catch (error) {
    console.error("Error in /movies/:movieId/theaters route:", error);
    next(error);
  }
});

router.get("/:movieId/reviews", async (req, res, next) => {
  const { movieId } = req.params;

  try {
    const reviews = await knex("reviews")
      .where("movie_id", movieId)
      .join("critics", "reviews.critic_id", "=", "critics.critic_id")
      .select(
        "reviews.review_id",
        "reviews.content",
        "reviews.score",
        "reviews.created_at",
        "reviews.updated_at",
        "reviews.critic_id",
        "reviews.movie_id",
        "critics.critic_id as critic_id",
        "critics.preferred_name",
        "critics.surname",
        "critics.organization_name",
        "critics.created_at as critic_created_at",
        "critics.updated_at as critic_updated_at"
      )
      .orderBy("reviews.created_at", "desc");

    const transformedData = reviews.map((review) => {
      return {
        review_id: review.review_id,
        content: review.content,
        score: review.score,
        created_at: review.created_at,
        updated_at: review.updated_at,
        critic_id: review.critic_id,
        movie_id: review.movie_id,
        critic: {
          critic_id: review.critic_id,
          preferred_name: review.preferred_name,
          surname: review.surname,
          organization_name: review.organization_name,
          created_at: review.critic_created_at,
          updated_at: review.critic_updated_at,
        },
      };
    });

    res.json({ data: transformedData });
  } catch (error) {
    console.error("Error in /movies/:movieId/reviews route:", error);
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { is_showing } = req.query;

    let movies;

    if (is_showing === "true") {
      movies = await knex("movies")
        .join(
          "movies_theaters",
          "movies.movie_id",
          "=",
          "movies_theaters.movie_id"
        )
        .where("movies_theaters.is_showing", true)
        .distinct("movies.movie_id")
        .select("movies.*");
    } else {
      movies = await knex("movies").select("*");
    }

    res.json({ data: movies });
  } catch (error) {
    console.error("Error in /movies route:", error);
    next(error);
  }
});

module.exports = router;
