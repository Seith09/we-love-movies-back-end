const express = require("express");
const router = express.Router();
const knex = require("../db/connection");

router.put("/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;
  const updatedReviewData = req.body.data;

  try {
    const existingReview = await knex("reviews")
      .where({ review_id: reviewId })
      .first();

    if (!existingReview) {
      return res.status(404).json({ error: "Review cannot be found." });
    }

    const updateData = Object.entries(updatedReviewData)
      .filter(([key, value]) => value !== undefined && key !== "data")
      .reduce((acc, [key, value]) => {
        if (["content", "score"].includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {});

    if (Object.keys(updateData).length === 0) {
      const reviewWithCritic = await knex("reviews")
        .where({ review_id: reviewId })
        .join("critics", "reviews.critic_id", "=", "critics.critic_id")
        .select(
          "reviews.*",
          "critics.critic_id as critic_id",
          "critics.preferred_name",
          "critics.surname",
          "critics.organization_name",
          "critics.created_at as critic_created_at",
          "critics.updated_at as critic_updated_at"
        )
        .first();

      return res.status(200).json({ data: reviewWithCritic });
    }

    await knex("reviews").where({ review_id: reviewId }).update(updateData);

    const updatedReviewWithCritic = await knex("reviews")
      .where({ review_id: reviewId })
      .join("critics", "reviews.critic_id", "=", "critics.critic_id")
      .select(
        "reviews.*",
        "critics.critic_id as critic_id",
        "critics.preferred_name",
        "critics.surname",
        "critics.organization_name",
        "critics.created_at as critic_created_at",
        "critics.updated_at as critic_updated_at"
      )
      .first();

    updatedReviewWithCritic.updated_at =
      updatedReviewWithCritic.updated_at.toString();

    const responseWithCritic = {
      ...updatedReviewWithCritic,
      critic: {
        critic_id: updatedReviewWithCritic.critic_id,
        preferred_name: updatedReviewWithCritic.preferred_name,
        surname: updatedReviewWithCritic.surname,
        organization_name: updatedReviewWithCritic.organization_name,
        created_at: updatedReviewWithCritic.critic_created_at,
        updated_at: updatedReviewWithCritic.critic_updated_at,
      },
    };

    res.status(200).json({ data: responseWithCritic });
  } catch (error) {
    next(error);
  }
});

router.delete("/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    const review = await knex("reviews").where({ review_id: reviewId }).first();

    if (!review) {
      return res
        .status(404)
        .json({ error: `Review with ID ${reviewId} not found` });
    }

    await knex("reviews").where({ review_id: reviewId }).del();

    res.status(204).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
