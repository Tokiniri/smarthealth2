const express = require("express");
const { calculateMedicalBill } = require("./medical-bill");

const app = express();
app.use(express.json());

app.post("/api/medical-bill", (req, res) => {
  const { type, nightEmergency, age, mutuelle } = req.body;

  if (!type || age === undefined) {
    return res.status(400).json({ error: "Champs requis : type, age" });
  }

  const result = calculateMedicalBill({
    type,
    nightEmergency: !!nightEmergency,
    age,
    mutuelle
  });

  return res.status(200).json(result);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("SmartHealth API démarrée sur http://localhost:" + PORT);
});

module.exports = app;
