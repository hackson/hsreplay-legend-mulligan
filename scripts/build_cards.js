const fs = require('fs');
const https = require('follow-redirects').https;

const HEARTHSTONE_CARDS_JSON_URL =
    'https://api.hearthstonejson.com/v1/latest/enUS/cards.json';

const CARDS_JSON_PATH = '../cards/cards.json';

const WHITELISTED_ATTRIBUTES = {
  'id': 1,
  'dbfId': 1,
  'name': 1,
};

function scrubCardsJson(cardsJson) {
  for (const cardJson of cardsJson) {
    for (const key in cardJson) {
      if (!(key in WHITELISTED_ATTRIBUTES)) {
        delete cardJson[key];
      }
    }
  }
}

function writeJson(json) {
  fs.writeFile(
      CARDS_JSON_PATH,
      JSON.stringify(json),
      e => e && console.error(`Error writing cards JSON: ${e.message}`));
};

function fetchCardsJson() {
  https.get(HEARTHSTONE_CARDS_JSON_URL, res => {
    const {statusCode} = res;
    if (statusCode != 200) {
      console.error(`Error: Get status code ${statusCode}`);
      return;
    }

    let content = '';
    res.on('data', chunk => content += chunk);
    res.on('end', () => {
      try {
        const jsonContent = JSON.parse(content);
        scrubCardsJson(jsonContent);
        writeJson(jsonContent);
        console.log('Done.');
      } catch (e) {
        console.error(`Error: Failed to parse JSON content ${e.message}`);
      }
    });
  }).on('error', e => console.error(`Error: ${e.message}`));
};

fetchCardsJson();
