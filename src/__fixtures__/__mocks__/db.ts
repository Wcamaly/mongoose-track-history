/* eslint-disable no-param-reassign, jest/require-top-level-describe, jest/no-hooks */
/* eslint-disable no-param-reassign */

import {MongoMemoryServer} from 'mongodb-memory-server';

const DB = jest.requireActual('../db').default;

const mongod =  MongoMemoryServer.create();

DB.autoIndexOnceInDev = (opts: any) => {
  opts.config.autoIndex = false;
};
DB.consoleErr = () => {};
DB.consoleLog = () => {};

const actualInit = DB.init;
DB.init = async () => {
  process.env.MONGO_CONNECTION_STRING = (await mongod).getUri();
  return actualInit();
};

const actualClose = DB.close;
DB.close = async () => {
  await actualClose();
  (await mongod).stop();
};

export default DB;

beforeAll(async () => await DB.init());
afterAll(async () => await DB.close());
