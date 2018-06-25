const fs = require('fs');
const https = require('follow-redirects').https;

const HSREPLAY_ARCHETYPES_URL = 'https://hsreplay.net/api/v1/archetypes/';

const ARCHETYPES_JSON_PATH = '../data/archetypes.json';

function isStandard(archetype) {
  return !!archetype['standard_ccp_signature_core'];
}

function filterArchetypes(archetypes) {
  // Remove non standard.
  for (let i = archetypes.length - 1; i >= 0; --i) {
    const archetype = archetypes[i];
    if (!isStandard(archetype)) {
      archetypes.splice(i, 1);
    }
  }
  // TODO: Perhaps whitelist the fields.
};

function writeJson(json) {
  fs.writeFile(
      ARCHETYPES_JSON_PATH,
      JSON.stringify(json),
      e => e && console.error(`Error writing archetypes JSON: ${e.message}`));
};

function fetchArchetypesJson() {
  https.get(HSREPLAY_ARCHETYPES_URL, res => {
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
        filterArchetypes(jsonContent);
        writeJson(jsonContent);
        console.log('Done.');
      } catch (e) {
        console.error(`Error: Failed to parse JSON content ${e.message}`);
      }
    });
  }).on('error', e => console.error(`Error: ${e.message}`));
};

fetchArchetypesJson();
