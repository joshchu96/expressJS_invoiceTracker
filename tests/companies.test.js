const request = require("supertest");
const app = require("../app");

describe("Testing GET routes", () => {
  test("retrieve all companies", async () => {
    const response = await request(app).get("/companies/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      companies: [
        {
          code: "comp1",
          name: "test company 1",
          description: "Creator of fake device 1",
        },
        {
          code: "comp2",
          name: "test company 2",
          description: "Ecommerce store",
        },
      ],
    });
  });

  //GET: return specific company by code
  test("retrieve company by code", async () => {
    const response = await request(app).get("/companies/comp1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "comp1",
        name: "test company 1",
        description: "Creator of fake device 1",
      },
    });
  });
});
