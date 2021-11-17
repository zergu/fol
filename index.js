const request = require('request-promise');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3');

const profiles = [
  'https://twitter.com/orion_money',
  'https://twitter.com/kartracingnft',
  'https://twitter.com/ensdomains',
  'https://twitter.com/OlympusDAO',
  'https://twitter.com/CryptoVsZombie',
  'https://twitter.com/MakerDAO',
  'https://twitter.com/WarenaOfficial',
  'https://twitter.com/demoleio',
  'https://twitter.com/ProjectSeedGame',
  'https://twitter.com/TheSandboxGame',
  'https://twitter.com/GuildOfGuardian',
  'https://twitter.com/PlayEmberSword',
];

/**
 * TODO:
 * - cron
 * - data presentation
 */

const db = new sqlite3.Database('./followers.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.log("Getting error " + err);
    exit(1);
  }
});

const getOrCreateProfile = function (url) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT rowid FROM profile WHERE url = '${url}'`, function (err, row) {
      if (row) {
        resolve(row.rowid);
      } else {
        db.run(`INSERT INTO profile (url) VALUES ('${url}')`, (err) => {
          if (err) {
            console.error(err);
          } else {
            resolve(this.lastId);
          }
        });
      }
    });
  });
}

const hasStats = function (profileId, date) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT rowid FROM profile_stats WHERE profile_id = ${profileId} AND day = '${date}'`, (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(row !== undefined);
    });
  })
}

const getTodaysDate = function () {
  const today = new Date();

  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

const getStats = function (profileId, url) {
  request(url)
    .then(function (html) {
      const $ = cheerio.load(html);
      const followers = $('a[data-nav="followers"]').attr('title').replace(/\D/g, '');
      const name = $('a.ProfileHeaderCard-nameLink').text();
      db.exec(`UPDATE profile SET name = '${name}' WHERE rowid = ${profileId}`);
      db.exec(`INSERT INTO profile_stats (profile_id, day, followers) VALUES (${profileId}, '${getTodaysDate()}', '${followers}')`);
    })
    .catch(function (err) {
      console.error(err);
    });
}

const sleep = (seconds) => {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds * 1000));
};

/* Main */

profiles.forEach(function (url, index) {
  getOrCreateProfile(url).then((profileId) => {
    hasStats(profileId, getTodaysDate()).then((result) => {
      if (!result) {
        getStats(profileId, url);
      }
    })
  });
  
  sleep(2);
});

