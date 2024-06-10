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
router.get("/:code", async (request, response, next) => {
  try {
    const code = "apple";

    // Query to fetch company and its invoices
    const results = await db.query(
      `SELECT 
        companies.code, 
        companies.name, 
        companies.description, 
        invoices.id AS invoice_id
      FROM 
        companies 
      LEFT JOIN 
        invoices 
      ON 
        companies.code = invoices.comp_code 
      WHERE 
        companies.code = $1::text`,
      [code]
    );

    // If no rows are returned, the company does not exist
    if (results.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }

    // Extract company details from the first row
    const companyDetails = results.rows[0];
    const company = {
      code: companyDetails.code,
      name: companyDetails.name,
      description: companyDetails.description,
      invoices: results.rows
        .filter((row) => row.invoice_id !== null)
        .map((row) => row.invoice_id),
    };

    return response.json({ company });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
