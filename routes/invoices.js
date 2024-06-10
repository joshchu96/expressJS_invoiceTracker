const router = require("express").Router();
const db = require("../db");
const ExpressError = require("../expressError");

//GET: return all info for the invoices.
router.get("/", async (request, response) => {
  const result = await db.query("SELECT * FROM invoices");
  response.json({ invoices: result.rows });
});

//GET: return specific invoice by ID.
router.get("/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const result = await db.query(
      "SELECT invoices.id, invoices.amt, invoices.paid, invoices.add_date, invoices.paid_date, companies.code AS company_code, companies.name AS company_name, companies.description AS company_description FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE invoices.id = $1",
      [id]
    );

    const invoices = result.rows[0];

    if (result.rows.length === 0) {
      throw new ExpressError("Invoice cannot be found", 404);
    } else {
      const resObj = {
        invoice: {
          id: invoices.id,
          amt: invoices.amt,
          paid: invoices.paid,
          add_date: invoices.add_date,
          paid_date: invoices.paid_date,
          company: {
            code: invoices.company_code,
            name: invoices.company_name,
            description: invoices.company_description,
          },
        },
      };

      response.json(resObj);
    }
  } catch (error) {
    return next(error);
  }
});

//POST: return new post of invoice to existing company
router.post("/", async (request, response) => {
  const { comp_code, amt } = request.body;
  const result = await db.query(
    "INSERT INTO invoices (comp_Code, amt) VALUES ($1, $2) RETURNING *",
    [comp_code, amt]
  );
  return response.json({ invoice: result.rows[0] });
});

//PUT: update existing invoice. if not found return 404.
router.put("/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const { amt } = request.body;
    const results = await db.query(
      "UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *",
      [amt, id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }
    return response.json({ invoice: results.rows[0] });
  } catch (error) {
    next(error);
  }
});

//DELETE: remove existing invoice and handle error with 404 if invoice not found
router.delete("/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const results = await db.query(
      "DELETE FROM invoices WHERE id=$1 RETURNING *",
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found", 404);
    }
    return response.json({ status: "deleted" });
  } catch (error) {
    next(error);
  }
});

// GET: Return a company and its invoices based on company code
router.get("/test/:code", async (request, response, next) => {
  const { code } = request.params;
  try {
    const companyRes = await db.query(
      "SELECT * FROM companies WHERE code = $1",
      [code]
    );

    const invoicesRes = await db.query(
      "SELECT * FROM invoices WHERE comp_code = $1",
      [code]
    );
    const company = companyRes.rows[0];
    company.invoices = invoicesRes.rows;
    response.json(company);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
