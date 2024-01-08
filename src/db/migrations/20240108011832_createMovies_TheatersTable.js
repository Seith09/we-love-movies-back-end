/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("movies_theaters", (table) => {
    table.increments("id").primary();
    table
      .integer("movie_id")
      .unsigned()
      .notNullable()
      .references("movie_id")
      .inTable("movies")
      .onDelete("CASCADE");
    table
      .integer("theater_id")
      .unsigned()
      .notNullable()
      .references("theater_id")
      .inTable("theaters")
      .onDelete("CASCADE");
    table.boolean("is_showing");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("movies_theaters");
};
