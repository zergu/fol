const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./followers.db', (err) => {
  if (err) {
    console.log("Getting error " + err);
    exit(1);
  }

  // db.exec(`
  //   CREATE TABLE profile (
  //       name text null,
  //       url text not null
  //   );
  //   `);

  // db.exec(`
  //   CREATE TABLE profile_stats (
  //       profile_id int not null,
  //       day date not null,
  //       followers int not null
  //   );`);
    
  // db.exec(`UPDATE profile_stats SET day = '2021-11-16'`);
});


