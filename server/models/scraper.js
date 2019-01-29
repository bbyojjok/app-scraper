const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const getKSTDate = () => {
  let date = new Date();
  date.setTime(date.getTime() + 9 * 3600000);
  return date;
};

const Scraper = new Schema({
  name: String,
  app: {
    googlePlay: Schema.Types.Mixed,
    appStore: Schema.Types.Mixed
  },
  reviews: {
    googlePlay: Schema.Types.Mixed,
    appStore: Schema.Types.Mixed
  },
  created: { type: Date, default: getKSTDate() },
  updated: { type: Date }
});

module.exports = mongoose.model('scraper', Scraper);
