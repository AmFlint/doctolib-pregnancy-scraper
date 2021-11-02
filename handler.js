const {
  displayAvailabilitySlots,
  formatDateToDisplay,
  requestDoctolib,
  buildDoctolibURL,
} = require('./lib');


const now = new Date();
const todayISO = now.toISOString().split('T')[0];
const inOneYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDay());

const dateFormHTML = `
<br/>
<label for="start">Date recherchée:</label>
<input type="date" id="start" name="trip-start"
       value="${todayISO}"
       min="${todayISO}" max="${inOneYear.toISOString().split('T')[0]}">
<button onclick="manageClick()">Rechercher à la date sélectionn</button>
<script>
function manageClick() {
  const input = document.querySelector('#start');
  document.location.href=\`\${window.location.origin}\${window.location.pathname}?startDate=\${input.value}\`;
}
</script>
`;

function returnResponse(expressions, statusCode) {
  return {
    statusCode,
    body: `${dateFormHTML}<br/><pre>${expressions.join('')}</pre>`,
    headers: {'Content-Type': 'text/html'}
  }
}

exports.handler = async function (event) {
  let expressions = [];
  const config = {
    // startDate must be yyyy-mm-dd like 2021-12-06 for 6 december 2021
    startDate: event.queryStringParameters?.startDate || '',
  };
  const requestURL = buildDoctolibURL(config);

  let availabilities = {};
  try {
    availabilities = await requestDoctolib(requestURL);
  } catch (e) {
    return {
      statusCode: 500,
      headers: {'Content-Type': 'text/html'},
      body: '<h1>An error occured while retrieving data from Doctolib\'s API</h1>',
    }
  }

  let [shouldGetNextSlot, expressionsToPrint] = displayAvailabilitySlots(availabilities);
  expressions.push(expressionsToPrint);
  
  
  if (!availabilities.next_slot) {
    expressions.push('\nPour le moment, aucune disponibilité n\'est prévue après la date demandée.');
  }

  // get next slot
  if (shouldGetNextSlot) {
    config.startDate = availabilities.next_slot.split('T')[0];
    expressions.push(`\nRecherche de créneaux pour la prochaine disponibilité indiqué par Doctolib: ${formatDateToDisplay(config.startDate)}`);
    const requestURL = buildDoctolibURL(config);
    const newAvailabilities = await requestDoctolib(requestURL);
    const [_, newExpressions] = displayAvailabilitySlots(newAvailabilities);
    expressions.push(newExpressions);
  }

  expressions.push(`\n\n<a href="https://www.doctolib.fr/hopital-public/saint-maurice/maternite-des-hopitaux-de-saint-maurice-saint-maurice">Pour réserver: Cliquez sur ce lien</a>\n`)

  return returnResponse(expressions, 200);
};
