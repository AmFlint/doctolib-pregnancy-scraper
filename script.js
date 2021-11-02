// https://www.doctolib.fr/availabilities.json?start_date=2021-10-30&visit_motive_ids=136937&agenda_ids=402484&insurance_sector=public&practice_ids=9896&limit=3
const {
  displayAvailabilitySlots,
  formatDateToDisplay,
  requestDoctolib,
  buildDoctolibURL,
} = require('./lib');

let startDate = '';
const args = process.argv;
if (args.length >= 3) {
  startDate = args[2];
}

async function main() {
  const config = {
    startDate,
  };
  const requestURL = buildDoctolibURL(config);

  const availabilities = await requestDoctolib(requestURL);

  const [shouldGetNextSlot, expressionsToPrint] = displayAvailabilitySlots(availabilities);
  console.log(expressionsToPrint)
  
  if (!availabilities.next_slot) {
    console.log('\nPour le moment, aucune disponibilité n\'est prévue après la date demandée.');
    process.exit(0);
  }

  // get next slot
  if (shouldGetNextSlot) {
    config.startDate = availabilities.next_slot.split('T')[0];
    console.log(`\nRecherche de créneaux pour la prochaine disponibilité indiqué par Doctolib: ${formatDateToDisplay(config.startDate)}`)
    const requestURL = buildDoctolibURL(config);
    const newAvailabilities = await requestDoctolib(requestURL);
    const [_, newExpressions] = displayAvailabilitySlots(newAvailabilities);
    console.log(newExpressions);
  }

  console.log(`Pour réserver: https://www.doctolib.fr/hopital-public/saint-maurice/maternite-des-hopitaux-de-saint-maurice-saint-maurice\n`);
}

main();
