const fs = require('fs');
const bigInt = require('big-integer');
const constants = require('./constants');
const deckstrings = require('deckstrings');
const https = require('follow-redirects').https;
const md5 = require('md5');

const {Class, ARCHETYPES_JSON_PATH, CARDS_JSON_PATH} = require('./constants');

const RAW = false;
const AS_JSON = true;

exports.getClassId =
    className => Class[className.toUpperCase()] || -1;

exports.getClassName = classId => {
  for (const className in Class) {
    if (Class[className] == classId) {
      return className[0] + className.substr(1).toLowerCase();
    }
  }
  return 'Invalid';
};

let cachedArchetypes = null;

exports.loadArchetypes = () => {
  if (!cachedArchetypes) {
    cachedArchetypes = JSON.parse(fs.readFileSync(ARCHETYPES_JSON_PATH))
      .reduce(
          (map, archetype) => {
            map[archetype[constants.ARCHETYPES_ID_FIELD]] = archetype;
            return map;
          },
          {});
  }
  return cachedArchetypes;
};

let cachedCards = null;

exports.loadCards = () => {
  if (!cachedCards) {
    cachedCards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH))
      .reduce(
          (map, card) => {
            map[card[constants.CARDS_ID_FIELD]] = card;
            return map;
          },
          {});
  }
  return cachedCards;
};

exports.isLowRankReplay = replay => {
  const p1Rank = replay[constants.P1_RANK_FIELD];
  const p2Rank = replay[constants.P2_RANK_FIELD];
  return (p1Rank != 'None' && parseInt(p1Rank) > constants.MIN_RANK_TO_RECORD)
    || (p2Rank != 'None' && parseInt(p2Rank) > constants.MIN_RANK_TO_RECORD);
};

const fetchInternal_ = (url, callback, shouldParseAsJson) => {
  https.get(url, res => {
    const {statusCode} = res;
    if (statusCode != 200) {
      console.error(`Error: Get status code ${statusCode}`);
      return;
    }

    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      const content = Buffer.concat(chunks);
      callback(
        shouldParseAsJson ? JSON.parse(content.toString('utf8')) : content);
    });
  }).on('error', e => console.error(`Error: ${e.message}`));
};

exports.fetch = (url, callback) => fetchInternal_(url, callback, RAW);

exports.fetchJson = (url, callback) => fetchInternal_(url, callback, AS_JSON);

const ALPHABETS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MD5_BASE = 16;

exports.computeShortId = cards => {
  const value = bigInt(md5(cards.sort().join(',')), MD5_BASE);
  let shortId = '';
  let base = ALPHABETS.length;
  for (let v = value; !v.eq(bigInt.zero); v = v.over(base)) {
    const mod = v.mod(base);
    shortId += ALPHABETS[mod];
  }
  return shortId;
};

exports.computeDeckCode = (format, className, cards) => {
  const cardSet = exports.loadCards();
  const classId = exports.getClassId(className);
  const canonicalCardsSet = {};
  cards.reduce(
      (map, card) => {
        const dbfId = cardSet[card].dbfId;
        if (dbfId in map) {
          map[dbfId]++;
        } else {
          map[dbfId] = 1;
        }
        return map;
      }, canonicalCardsSet);
  const canonicalCards = [];
  for (const dbfId in canonicalCardsSet) {
    canonicalCards.push([parseInt(dbfId), canonicalCardsSet[dbfId]]);
  }
  const canonicalFormat = {
    cards: canonicalCards,
    heroes: [classId],
    format: format
  };
  return deckstrings.encode(canonicalFormat);
}
