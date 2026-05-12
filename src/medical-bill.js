
/**
 * Retourne le tarif de base selon le type de consultation.
 * @param {string} type - "Specialist" ou autre
 * @returns {number} tarif en euros
 */
function getBasePrice(type) {
  return type === "Specialist" ? 80 : 50;
}

/**
 * Applique la majoration "Urgence de Nuit" si applicable.
 * La majoration est annulee si le patient a 65 ans ou plus.
 * @param {number} basePrice
 * @param {boolean} nightEmergency
 * @param {number} age
 * @returns {{ price: number, note: string }}
 */
function applyNightEmergency(basePrice, nightEmergency, age) {
  if (!nightEmergency) {
    return { price: basePrice, note: "Consultation standard" };
  }
  if (age >= 65) {
    return { price: basePrice, note: "Majoration nuit supprimee (patient senior)" };
  }
  return { price: basePrice * 2, note: "Urgence de nuit appliquee" };
}

/**
 * Calcule la prise en charge selon la mutuelle.
 * @param {number} totalPrice
 * @param {string} mutuelle - "Premium", "Basique", ou autre
 * @returns {{ covered: number, remaining: number }}
 */
function applyMutuelle(totalPrice, mutuelle) {
  if (mutuelle === "Premium") {
    return { covered: totalPrice, remaining: 0 };
  }
  if (mutuelle === "Basique") {
    return { covered: totalPrice * 0.7, remaining: totalPrice * 0.3 };
  }
  return { covered: 0, remaining: totalPrice };
}

/**
 * Calcule la facture medicale complete.
 * @param {{ type: string, nightEmergency: boolean, age: number, mutuelle: string }} data
 * @returns {{ total: number, covered: number, remaining: number, note: string }}
 */
function calculateMedicalBill(data) {
  const basePrice = getBasePrice(data.type);
  const { price, note } = applyNightEmergency(basePrice, data.nightEmergency, data.age);
  const { covered, remaining } = applyMutuelle(price, data.mutuelle);

  return {
    total: price,
    covered: Math.round(covered * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    note
  };
}

module.exports = { calculateMedicalBill, getBasePrice, applyNightEmergency, applyMutuelle };
