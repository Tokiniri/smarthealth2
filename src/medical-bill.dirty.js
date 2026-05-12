

/* eslint-disable complexity */
function calculateMedicalBill(data) {
  var price = 0;
  var covered = 0;
  var remaining = 0;
  var note = "";

  if (data.type === "Specialist") {
    price = 80;
    if (data.nightEmergency === true) {
      if (data.age >= 65) {
        price = 80;
        note = "Majoration nuit supprimee (patient senior)";
      } else {
        price = 80 * 2;
        note = "Urgence de nuit appliquee";
      }
    } else {
      note = "Consultation specialiste standard";
    }
  } else {
    price = 50;
    if (data.nightEmergency === true) {
      if (data.age >= 65) {
        price = 50;
        note = "Majoration nuit supprimee (patient senior)";
      } else {
        price = 50 * 2;
        note = "Urgence de nuit appliquee";
      }
    } else {
      note = "Consultation generale standard";
    }
  }

  if (data.mutuelle === "Premium") {
    covered = price;
    remaining = 0;
  } else {
    if (data.mutuelle === "Basique") {
      covered = price * 0.7;
      remaining = price * 0.3;
    } else {
      covered = 0;
      remaining = price;
    }
  }

  return {
    total: price,
    covered: covered,
    remaining: remaining,
    note: note
  };
}

module.exports = { calculateMedicalBill };
