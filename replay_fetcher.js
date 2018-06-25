const ReplayProcessor = require('./replay_processor');
const constants = require('./constants');
const util = require('./util');

const {HSREPLAY_LIVE_FEED_PATH} = require('./constants');

class ReplayFetcher {
  constructor(dbWrapper) {
    this.dbWrapper_ = dbWrapper;
    this.replayProcessor_ = new ReplayProcessor(dbWrapper);
  }

  fetch() {
    util.fetchJson(
        HSREPLAY_LIVE_FEED_PATH,
        dataJson => {
          const replaysJson = dataJson['data'];
          this.filterReplaysAndProcess_(replaysJson);
        });
  }

  filterReplaysAndProcess_(replays) {
    // Drop if rank requirement doesn't match.
    this.filterLowRankReplays_(replays);
    // Drop if replay is stored already.
    this.filterStoredReplaysAndProcess_(replays);
  }

  filterLowRankReplays_(replays) {
    this.genericFiltering_(replays, util.isLowRankReplay);
  }

  filterStoredReplaysAndProcess_(replays) {
    const replayIds = replays.map(replay => replay[constants.REPLAY_ID_FIELD]);
    this.dbWrapper_.queryExistingIds(
        replayIds,
        existingIds => {
          this.genericFiltering_(
            replays,
            replay => {
              return existingIds.indexOf(replay[constants.REPLAY_ID_FIELD]) >= 0;
            });
          console.log(`${replays.length} Replays to add`);
          this.replayProcessor_.process(replays);
        });
  }

  genericFiltering_(replays, fn) {
    for (let i = replays.length - 1; i >= 0; --i) {
      if (fn(replays[i])) {
        replays.splice(i, 1);
      }
    }
  }
}

module.exports = ReplayFetcher;
