const request = require("supertest");
const app = require("../src/app");
const {
  calculateMedicalBill,
  getBasePrice,
  applyNightEmergency,
  applyMutuelle
} = require("../src/medical-bill");

// ============================================================
// Tests unitaires des sous-fonctions
// ============================================================

describe("getBasePrice()", () => {
  test("retourne 80€ pour un Specialiste", () => {
    expect(getBasePrice("Specialist")).toBe(80);
  });

  test("retourne 50€ pour une consultation generale", () => {
    expect(getBasePrice("General")).toBe(50);
  });

  test("retourne 50€ si le type est inconnu", () => {
    expect(getBasePrice("Inconnu")).toBe(50);
  });
});

describe("applyNightEmergency()", () => {
  test("sans urgence de nuit : prix inchange", () => {
    const result = applyNightEmergency(50, false, 30);
    expect(result.price).toBe(50);
    expect(result.note).toBe("Consultation standard");
  });

  test("urgence de nuit sur patient jeune : prix double", () => {
    const result = applyNightEmergency(50, true, 40);
    expect(result.price).toBe(100);
    expect(result.note).toContain("Urgence de nuit");
  });

  test("urgence de nuit sur patient > 65 ans : majoration supprimee", () => {
    const result = applyNightEmergency(50, true, 70);
    expect(result.price).toBe(50);
    expect(result.note).toContain("senior");
  });

  test("urgence de nuit sur patient exactement 65 ans : majoration supprimee (borne incluse)", () => {
    const result = applyNightEmergency(80, true, 65);
    expect(result.price).toBe(80);
  });

  test("urgence de nuit sur specialiste patient jeune : 160€", () => {
    const result = applyNightEmergency(80, true, 30);
    expect(result.price).toBe(160);
  });
});

describe("applyMutuelle()", () => {
  test("mutuelle Premium : reste a charge = 0€", () => {
    const result = applyMutuelle(100, "Premium");
    expect(result.covered).toBe(100);
    expect(result.remaining).toBe(0);
  });

  test("mutuelle Basique : 70% pris en charge", () => {
    const result = applyMutuelle(100, "Basique");
    expect(result.covered).toBe(70);
    expect(result.remaining).toBe(30);
  });

  test("sans mutuelle : 0% pris en charge", () => {
    const result = applyMutuelle(100, null);
    expect(result.covered).toBe(0);
    expect(result.remaining).toBe(100);
  });

  test("mutuelle inconnue : 0% pris en charge", () => {
    const result = applyMutuelle(80, "Inconnu");
    expect(result.covered).toBe(0);
    expect(result.remaining).toBe(80);
  });
});

// ============================================================
// Tests integration de calculateMedicalBill()
// ============================================================

describe("calculateMedicalBill() - Integration des regles metier", () => {
  test("Consultation generale standard sans mutuelle", () => {
    const result = calculateMedicalBill({
      type: "General",
      nightEmergency: false,
      age: 35,
      mutuelle: null
    });
    expect(result.total).toBe(50);
    expect(result.covered).toBe(0);
    expect(result.remaining).toBe(50);
  });

  test("Consultation specialiste standard avec mutuelle Basique", () => {
    const result = calculateMedicalBill({
      type: "Specialist",
      nightEmergency: false,
      age: 45,
      mutuelle: "Basique"
    });
    expect(result.total).toBe(80);
    expect(result.covered).toBe(56);
    expect(result.remaining).toBe(24);
  });

  test("Urgence de nuit generale, patient 40 ans, mutuelle Premium", () => {
    const result = calculateMedicalBill({
      type: "General",
      nightEmergency: true,
      age: 40,
      mutuelle: "Premium"
    });
    expect(result.total).toBe(100);
    expect(result.covered).toBe(100);
    expect(result.remaining).toBe(0);
  });

  test("Urgence de nuit, patient 70 ans (senior) : majoration supprimee", () => {
    const result = calculateMedicalBill({
      type: "General",
      nightEmergency: true,
      age: 70,
      mutuelle: "Basique"
    });
    expect(result.total).toBe(50);
    expect(result.covered).toBe(35);
    expect(result.remaining).toBe(15);
  });

  test("Urgence de nuit specialiste, jeune patient, sans mutuelle", () => {
    const result = calculateMedicalBill({
      type: "Specialist",
      nightEmergency: true,
      age: 25,
      mutuelle: null
    });
    expect(result.total).toBe(160);
    expect(result.covered).toBe(0);
    expect(result.remaining).toBe(160);
  });

  test("Senior 66 ans, specialiste, urgence nuit, Premium", () => {
    const result = calculateMedicalBill({
      type: "Specialist",
      nightEmergency: true,
      age: 66,
      mutuelle: "Premium"
    });
    expect(result.total).toBe(80);
    expect(result.remaining).toBe(0);
  });
});

// ============================================================
// Tests API (routes Express)
// ============================================================

describe("POST /api/medical-bill", () => {
  test("200 - retourne une facture valide", async () => {
    const res = await request(app)
      .post("/api/medical-bill")
      .send({ type: "General", nightEmergency: false, age: 30, mutuelle: "Basique" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("covered");
    expect(res.body).toHaveProperty("remaining");
    expect(res.body).toHaveProperty("note");
  });

  test("400 - champs manquants", async () => {
    const res = await request(app)
      .post("/api/medical-bill")
      .send({ mutuelle: "Premium" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("200 - specialiste urgence nuit, mutuelle Premium -> reste 0€", async () => {
    const res = await request(app)
      .post("/api/medical-bill")
      .send({ type: "Specialist", nightEmergency: true, age: 30, mutuelle: "Premium" });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(160);
    expect(res.body.remaining).toBe(0);
  });
});
