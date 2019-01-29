const request = require('request');
const parseString = require('xml2js').parseString;

function AppStoreReview(app, country, page) {
  return new Promise((resolve, reject) => {
    const url =
      'https://itunes.apple.com/rss/customerreviews/page=' +
      page +
      '/id=' +
      app +
      '/sortby=mostrecent/xml?cc=' +
      country;

    request(url, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let data;
        parseString(body, (err, result) => {
          data = result;
          if (err) {
            reject(err);
          }
        });

        let reviews = [];
        let entry = data['feed']['entry'];
        for (let i = 0; i < entry.length; i++) {
          let rawReview = entry[i];
          if ('author' in rawReview) {
            try {
              let comment = {};
              comment.id = rawReview['id'][0];
              comment.app = app;
              comment.author = rawReview['author'][0]['name'][0];
              comment.version = rawReview['im:version'][0];
              comment.rate = rawReview['im:rating'][0];
              comment.title = rawReview['title'][0];
              comment.comment = rawReview['content'][0]['_'];
              comment.vote = rawReview['im:voteCount'][0];
              comment.updated = rawReview['updated'][0];
              comment.country = country;
              reviews.push(comment);
            } catch (err) {
              reject(err);
            }
          }
        }
        resolve(reviews);
      } else {
        reject(err);
      }
    });
  });
}

module.exports = AppStoreReview;