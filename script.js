// https://www.doctolib.fr/availabilities.json?start_date=2021-10-30&visit_motive_ids=136937&agenda_ids=402484&insurance_sector=public&practice_ids=9896&limit=3
const axios = require('axios');

let startDate = '';
const args = process.argv;
if (args.length >= 3) {
  startDate = args[2];
}

const API_URL = 'https://www.doctolib.fr/availabilities.json';
// This motive ID is for "Suivi de grossesse"
const VISIT_MOTIVE_ID = 136937;
// start Date -> date for which you want to start looking for availabilities
// by default, get today's date and format it yyyy-mm-dd e.g. 2021-10-30
const START_DATE = new Date().toISOString().split('T')[0];
// Agenda ID is the doctor you want to see (in our case, Marie Bonningues)
const AGENDA_ID = 402484;
// Specialty of the doctor you want to meet, in our case "Sage Femme"
const PRACTICE_ID = 9896;
//
const INSURANCE_SECTOR = 'public';
// Number of days you want to check availabilities for.
// Will check for availabilities during the NB_OF_DAYS from START_DATE (included)
const NB_OF_DAYS = 7;
// language in which you want the date to be displayed
const DATE_LOCALE = 'fr-FR';

// Send HTTP request to Doctolib API with
function buildDoctolibURL(config = null) {

  const expressions = [];

  expressions.push(`start_date=${config?.startDate || START_DATE}`);
  expressions.push(`visit_motive_ids=${VISIT_MOTIVE_ID}`);
  expressions.push(`agenda_ids=${AGENDA_ID}`);
  expressions.push(`insurance_sector=${INSURANCE_SECTOR}`);
  expressions.push(`practice_ids=${PRACTICE_ID}`);
  expressions.push(`limit=${NB_OF_DAYS}`);

  return `${API_URL}?${expressions.join('&')}`;
}

async function requestDoctolib(requestURL) {
  const response = await axios.get(requestURL);
  return response.data;
}

// date is format yyyy-mm-dd like 2021-10-30
function formatDateToDisplay(date) {
  const jsDate = new Date(date);
  const day = jsDate.toLocaleDateString(DATE_LOCALE, { weekday: 'long' });
  const month = jsDate.toLocaleDateString(DATE_LOCALE, { month: 'long' });
  const nbDayInMonth = jsDate.getDate();
  return `\t${day} ${nbDayInMonth} ${month}`;
}

function displayAvailabilitySlots(availabilities) {
  if (availabilities.total === 0) {
    console.log('Aucune disponibilité pour les jours suivants:\n');
    availabilities.availabilities.forEach(a => console.log(formatDateToDisplay(a.date)));
    return true;
  } else {
    console.log('\nIl y a des créneaux disponibles pour les plages horaires suivantes:\n');
    availabilities.availabilities.forEach(a => {
      // Don't print anything if there is no availability
      if (a.slots.length === 0) return;
      console.log(`${formatDateToDisplay(a.date)}:\n`);
      a.slots.forEach(slot => {
        const formattedSlot = slot.split('T')[1].split('.')[0];
        console.log(`\t\t${formattedSlot}\n`);
      });
    })
  }

  return false;
}

async function main() {
  const config = {
    startDate,
  };
  const requestURL = buildDoctolibURL(config);

  const availabilities = await requestDoctolib(requestURL);

  const shouldGetNextSlot = displayAvailabilitySlots(availabilities);
  
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
    displayAvailabilitySlots(newAvailabilities);
  }

  console.log(`Pour réserver: https://www.doctolib.fr/hopital-public/saint-maurice/maternite-des-hopitaux-de-saint-maurice-saint-maurice\n`);
}

main();
