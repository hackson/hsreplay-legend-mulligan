const FRIENDLY_PLAYER_FIELD = 'friendly_player';
const OPPOSING_PLAYER_FIELD = 'opposing_player';
const PLAYER_ID_FIELD = 'player_id';
const FRIENDLY_DECK_FIELD = 'friendly_deck';
const CARDS_FIELD = 'cards';
const IS_SPECTATOR_FIELD = 'spectator_mode';
const WON_FIELD = 'won';
const RANK_FIELD = 'rank';
const LEGEND_RANK_FIELD = 'legend_rank';
const REPLAY_XML_FIELD = 'replay_xml';
const HERO_CLASS_NAME_FIELD = 'hero_class_name';
const GLOBAL_GAME_FIELD = 'global_game';
const FORMAT_FIELD = 'format';
const LADDER_SEASON_FIELD = 'ladder_season';
const BUILD_FIELD = 'build';
const MATCH_END_TIME_FIELD = 'match_end';

class Game {
  constructor(gameJson) {
    this.gameJson_ = gameJson;

    const friendlyPlayer = this.gameJson_[FRIENDLY_PLAYER_FIELD];

    this.playerType_ = friendlyPlayer[PLAYER_ID_FIELD];

    this.rank_ = friendlyPlayer[RANK_FIELD] || 'None';

    this.legendRank_ = friendlyPlayer[LEGEND_RANK_FIELD] || 'None';

    this.heroClassName_ = friendlyPlayer[HERO_CLASS_NAME_FIELD];

    this.isSpectator_ = this.gameJson_[IS_SPECTATOR_FIELD];

    const friendlyDeck = this.gameJson_[FRIENDLY_DECK_FIELD];
    this.cards_ = friendlyDeck[CARDS_FIELD];

    this.won_ = this.gameJson_[WON_FIELD];

    this.replayXml_ = this.gameJson_[REPLAY_XML_FIELD];

    this.opponentPlayer_ = this.gameJson_[OPPOSING_PLAYER_FIELD];

    this.globalGame_ = this.gameJson_[GLOBAL_GAME_FIELD];
  }

  isSpectator() {
    return this.isSpectator_;
  }

  getCards() {
    return this.cards_;
  }

  getPlayerType() {
    return this.playerType_;
  }

  getPlayerEntityType() {
    return this.getPlayerType() + 1;
  }

  hasWon() {
    return this.won_;
  }

  getRank() {
    return this.rank_;
  }

  getLegendRank() {
    return this.legendRank_;
  }

  getReplayXml() {
    return this.replayXml_;
  }

  getHeroClassName() {
    return this.heroClassName_;
  }

  getOpposingHeroClassName() {
    return this.opponentPlayer_[HERO_CLASS_NAME_FIELD];
  }

  getBuild() {
    return this.globalGame_[BUILD_FIELD];
  }

  getSeason() {
    return this.globalGame_[LADDER_SEASON_FIELD];
  }

  getMatchEndTime() {
    return new Date(this.globalGame_[MATCH_END_TIME_FIELD]);
  }

  getFormat() {
    return this.globalGame_[FORMAT_FIELD];
  }
}

module.exports = Game;
