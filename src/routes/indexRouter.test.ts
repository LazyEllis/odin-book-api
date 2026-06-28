import { describe, it } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

describe("Catch-All Route", () => {
  it("returns a 404 error if hit", async () => {
    await request(app)
      .get("/thing")
      .expect("Content-Type", /json/)
      .expect({ message: "Cannot GET /thing" })
      .expect(404);

    await request(app)
      .post("/thing")
      .expect("Content-Type", /json/)
      .expect({ message: "Cannot POST /thing" })
      .expect(404);

    await request(app)
      .put("/thing/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Cannot PUT /thing/1" })
      .expect(404);

    await request(app)
      .delete("/thing/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Cannot DELETE /thing/1" })
      .expect(404);
  });
});
