const sqlite3 = require('sqlite3');

let db = new sqlite3.Database('./followers.db', (err) => {
  if (err) {
    console.log("Getting error " + err);
    exit(1);
  }

  console.log('RESULTS:');

  const getResults = function (callback) {
    db.all(`
        SELECT p.name, s.day, s.followers FROM profile p
        JOIN profile_stats s ON p.rowid = s.profile_id
        ORDER BY p.name, s.day ASC`, (err, rows) => {
      callback(rows);

    });
  }

  const build = function (rows) {
    let projects = {};
    
    rows.forEach((row) => {
      if (row.name in projects) {
        projects[row.name]['days'] += 1;
        projects[row.name]['max_followers'] = row.followers;
      } else {
        projects[row.name] = {
          days: 0,
          min_followers: row.followers
        }
      }
    })

    Object.entries(projects).forEach(([key, row]) => {
      const avg = (row.max_followers - row.min_followers) / row.days;
      projects[key]['avg'] = avg;
      projects[key]['percent_increase'] = (avg / row.max_followers * 100).toFixed(2) + '%';
    });
    
    Object.entries(projects).forEach(([key, row]) => {
      console.log(key + ': ' + row.percent_increase);
    });
  }
  
  getResults(build);
});


