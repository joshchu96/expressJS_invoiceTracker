const router = require('express').Router();
const db = require('../db');

//GET: return list of companies
router.get("/", async(request,response) => {
    let result = await db.query('SELECT * FROM companies');
    return response.json({ companies: result.rows });
});

//GET: return object of company. if not found return 404 status res.
router.get("/:code", async(request, response) => {
    const {code} = request.params;
    let result = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);
    return response.json({ company: result.rows[0] });
});


//POST: adds a company. Given a json like {code, name, desc}
router.post("/", async(request, response) => {
    const { code, name, description } = request.body;
    const result = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description]);
    return response.json({ company: result.rows[0] });
})

module.exports = router;