// https://www.doctolib.fr/availabilities.json?start_date=2021-10-30&visit_motive_ids=136937&agenda_ids=402484&insurance_sector=public&practice_ids=9896&limit=3
const axios = require('axios');

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
  const response = await axios.get(requestURL, {
    headers: {"User-Agent": ""}
  });
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
  const expressionsToPrint = [];
  if (availabilities.total === 0) {
    expressionsToPrint.push('Aucune disponibilité pour les jours suivants:\n')
    availabilities.availabilities.forEach(a => expressionsToPrint.push(`${formatDateToDisplay(a.date)}\n`));
    return [true, expressionsToPrint.join('')];
  } else {
    expressionsToPrint.push('\nIl y a des créneaux disponibles pour les plages horaires suivantes:\n')
    availabilities.availabilities.forEach(a => {
      // Don't print anything if there is no availability
      if (a.slots.length === 0) return;
      expressionsToPrint.push(`${formatDateToDisplay(a.date)}:\n`)
      a.slots.forEach(slot => {
        const formattedSlot = slot.split('T')[1].split('.')[0];
        expressionsToPrint.push(`\t\t${formattedSlot}\n`)
      });
    })
  }

  return [false, expressionsToPrint.join('')];
}

module.exports = {
  buildDoctolibURL,
  formatDateToDisplay,
  displayAvailabilitySlots,
  requestDoctolib,
}
