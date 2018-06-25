const DbWrapper = require('./db_wrapper');
const ReplayFetcher = require('./replay_fetcher');
const constants = require('./constants');
const util = require('./util');

// Initialize.
const dbWrapper = new DbWrapper();
const replayFetcher = new ReplayFetcher(dbWrapper);

function spawnFetchLoop() {
  replayFetcher.fetch();
  setInterval(() => {
    replayFetcher.fetch();
  }, constants.FETCH_LOOP_TIME_MS);
}

function main() {
  spawnFetchLoop();
  // TODO: starts a server
};

main();
