/* eslint-disable no-console */

import mongoose, { Connection } from 'mongoose';

mongoose.Promise = global.Promise;

type DBNames = 'data';

export default class DB {
  static mongoose = mongoose;
  static consoleErr = console.error;
  static consoleLog = console.log;
  static _connectionStr: string;

  static data: Connection = mongoose.createConnection();

  static async init(connectionStr?: string) {
    try{
      if (connectionStr) this._connectionStr = connectionStr;
      const result = await Promise.all([DB.openDB('data')]);
      return result;
    } catch (e) {
      DB.consoleErr('Error Initializing DB', e);
    }
  }

  static async close() {
    const result= await Promise.all([DB.closeDB('data')]);
    return result;
  }

  static openDB(name: DBNames = 'data'): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const uri = process.env.MONGO_CONNECTION_STRING || this._connectionStr;
      const opts: any = {};

      opts.promiseLibrary = global.Promise;
      opts.autoReconnect = true;
      opts.reconnectTries = Number.MAX_VALUE;
      opts.reconnectInterval = 1000;
      opts.useNewUrlParser = true;

      const db: any = DB[name];

      db.consoleErr = DB.consoleErr;
      db.consoleLog = DB.consoleLog;

      db.on('error', (e: any) => {
        if (e.message.code === 'ETIMEDOUT') {
          db.consoleErr(Date.now(), e);
          db.connect(uri, opts);
        }
        db.consoleErr(e);
      });

      db.once('open', () => {
        db.consoleLog(`Successfully connected to ${uri}`);
        resolve(db);
      });
      db.once('disconnected', () => {
        db.consoleLog(`Disconnected from ${uri}`);
        reject();
      });

      db.openUri(uri, opts);
    });
  }

  static closeDB(name: DBNames = 'data'): Promise<any> {
    if (DB[name]) {
      return DB[name].close();
    }
    return Promise.resolve();
  }
}
