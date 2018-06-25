const format = require('string-format');

const STARTING_CARDS_XPATH =
    'Game/Block/[@entity="1"]/[@type="5"]/ShowEntity/[@cardID]';
const CHOICE_ELEMENT_XPATH_FORMAT =
    'Game/Block/[@entity="1"]/[@type="5"]/Choices/[@entity="{}"]/Choice';
const CHOSEN_ELEMENT_XPATH_FORMAT =
    'Game/Block/[@entity="1"]/[@type="5"]/ChosenEntities/[@entity="{}"]/Choice';
const MULLIGAN_ELEMENT_XPATH_FORMAT =
    'Game/Block/[@entity="{}"]/[@type="5"]';
const SHOW_ENTITY_TAG_NAME = 'ShowEntity';
const CARD_ID_FIELD = 'cardID';
const INDEX_FIELD = 'index';
const ENTITY_FIELD = 'entity';

exports.getStartingCards = replayXml => {
  return replayXml
    .findall(STARTING_CARDS_XPATH)
    .map(showEntity => showEntity.get(CARD_ID_FIELD));
};

exports.getMulliganCards = (game, replayXml) => {
  // TODO: reuse the obj as arg.
  const startingCards = exports.getStartingCards(replayXml);
  const playerEntityType = game.getPlayerEntityType();
  const startingCardsMapping = replayXml
    .findall(format(CHOICE_ELEMENT_XPATH_FORMAT, playerEntityType))
    .reduce(
        (map, choice) => {
          map[choice.get(ENTITY_FIELD)] = choice.get(INDEX_FIELD);
          return map;
        }, {});
  const replacedMapping = replayXml
    .findall(format(CHOSEN_ELEMENT_XPATH_FORMAT, playerEntityType))
    .reduce(
        (map, choice) => {
          const entity = choice.get(ENTITY_FIELD);
          delete map[entity];
          return map;
        }, startingCardsMapping);
  const replacedSlots = [];
  for (const key in replacedMapping) {
    replacedSlots.push(replacedMapping[key]);
  }
  const newCards = replayXml
    .find(format(MULLIGAN_ELEMENT_XPATH_FORMAT, playerEntityType))
    .findall(SHOW_ENTITY_TAG_NAME)
    .map(showEntity => showEntity.get(CARD_ID_FIELD));

  for (const newCard of newCards) {
    const indexToReplace = parseInt(replacedSlots.shift());
    startingCards[indexToReplace] = newCard;
  }

  return startingCards;
};
