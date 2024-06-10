const router = require("express").Router();
const db = require("../db");
const ExpressError = require("../expressError");

//GET: return list of companies
router.get("/", async (request, response) => {
  let result = await db.query("SELECT * FROM companies");
  return response.json({ companies: result.rows });
});

//GET: return object of company. if not found return 404 status res.
router.get("/:code", async (request, response, next) => {
  try {
    const { code } = request.params;
    let result = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      code,
    ]);

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return response.json({ company: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

//POST: adds a company. Given a json like {code, name, desc}
router.post("/", async (request, response) => {
  const { code, name, description } = request.body;
  const result = await db.query(
    "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
    [code, name, description]
  );
  return response.json({ company: result.rows[0] });
});

//PUT: edit existing company. Should return 404 if not found.
router.put("/:code", async (request, response, next) => {
  try {
    const { code } = request.params;
    const { name, description } = request.body;
    const result = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *",
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    return response.json({ company: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

//DELETE: deletes company. Return 404 if company not found.
router.delete("/:code", async (request, response, next) => {
  try {
    const { code } = request.params;
    await db.query("DELETE FROM companies WHERE code = $1 RETURNING *", [code]);

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    return response.json({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});



module.exports = router;
