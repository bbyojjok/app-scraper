const route = require('express').Router();
const sites = require('../../schedule/sites');
const validationAppid = require('../../schedule/validation');
const { Detail, Review } = require('../models/index');
const axios = require('axios');
const xl = require('excel4node');
const makeDir = require('make-dir');
const localhost = 'http://127.0.0.1:889';
const moment = require('moment');
moment.locale('ko');

/**
 * axios request
 * @param { String } url
 */
function getApi(url) {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        console.log('ERROR:', err);
        reject(err);
      });
  });
}

/**
 * GET 상세내용 조회
 * /details/사이트/운영체제
 * example: /details/hmall/android
 */
route.get('/details/:site/:os?', async (req, res) => {
  const site = req.params.site;
  const os = req.params.os;
  const queryResult = await Detail[site]
    .findOne({}, err => {
      if (err) return res.status(401).send(`DB Error: ${err}`);
    })
    .sort({ created: -1 });

  if (os) {
    res.send(queryResult[os]);
  } else {
    res.send(queryResult);
  }
});

/**
 * GET 리뷰 조회 (오늘부터 몇일전 기준으로 조회)
 * /review/사이트/요일/평점/운영체제
 * example: /review/hmall/7/1/android
 */
route.get('/review/:site/:date?/:score?/:os?', async (req, res) => {
  const site = req.params.site;
  const date = req.params.date;
  const score = req.params.score;
  const os = req.params.os;
  // 오늘까지
  const today = moment()
    .startOf('day')
    .format();
  // 오늘 자정까지
  const end = moment()
    .endOf('day')
    .format();
  const prevday = moment(end)
    .subtract(date, 'days')
    .format();
  const options = {
    date: {
      $gte: prevday,
      $lte: end
    },
    $or: [
      {
        'review.score': {
          $in: score.split('').reduce((acc, data) => {
            acc.push(parseInt(data, 10));
            return acc;
          }, [])
        }
      },
      {
        'review.rate': {
          $in: score.split('')
        }
      }
    ]
  };
  if (os) {
    options.os = os;
  }

  const queryResult = await Review[site]
    .find(options, err => {
      if (err) return res.status(401).send(`DB Error: ${err}`);
    })
    .sort({ date: -1 });

  const result = await queryResult.reduce((acc, data) => {
    let dateFormatChange = data;
    if (dateFormatChange.review.updated !== undefined) {
      dateFormatChange.review.updated = moment(dateFormatChange.date)
        .tz('Asia/Seoul')
        .format('YYYY. MM. DD');
    }
    if (dateFormatChange.review.date !== undefined) {
      dateFormatChange.review.date = moment(dateFormatChange.date)
        .tz('Asia/Seoul')
        .format('YYYY. MM. DD');
    }
    acc.push(dateFormatChange);
    return acc;
  }, []);

  res.send(result);
});

/**
 * GET 엑셀 다운 (요일별로 평점1~5점)
 * /xlsx/사이트/요일
 * example: /xlsx/hmall/7
 */
route.get('/xlsx/:site/:date?', async (req, res) => {
  const site = req.params.site;
  const date = req.params.date;
  const url = `${localhost}/api/review/${site}/${date}/12345/`;
  const today = moment()
    .startOf('day')
    .format('YYYYMMDD');
  const now = new Date().valueOf();
  const folder = makeDir.sync(`public/downloads/${today}/`);
  const file = `downloads/${today}/reviews_${site}_${date}_${now}.xlsx`;

  // 엑셀
  const wb = new xl.Workbook();
  const ws1 = wb.addWorksheet(`android - ${date}일 이전`);
  const ws2 = wb.addWorksheet(`ios - ${date}일 이전`);
  const style_head = wb.createStyle({
    font: {
      bold: true,
      color: '#000000',
      size: 13
    },
    alignment: {
      horizontal: ['center'],
      vertical: ['center']
    }
  });
  const style_right = wb.createStyle({
    alignment: {
      horizontal: ['right']
    }
  });
  const style_center = wb.createStyle({
    alignment: {
      horizontal: ['center'],
      vertical: ['center']
    }
  });

  // android sheet
  ws1
    .cell(1, 1)
    .string('평점')
    .style(style_head);
  ws1
    .cell(1, 2)
    .string('날짜')
    .style(style_head);
  ws1
    .cell(1, 3)
    .string('리뷰')
    .style(style_head);
  ws1
    .cell(1, 4)
    .string('작성자')
    .style(style_head);
  ws1.column(1).setWidth(10);
  ws1.column(2).setWidth(15);
  ws1.column(3).setWidth(100);
  ws1.column(4).setWidth(30);
  ws1
    .row(1)
    .setHeight(30)
    .filter();

  // ios sheet
  ws2
    .cell(1, 1)
    .string('평점')
    .style(style_head);
  ws2
    .cell(1, 2)
    .string('날짜')
    .style(style_head);
  ws2
    .cell(1, 3)
    .string('제목')
    .style(style_head);
  ws2
    .cell(1, 4)
    .string('리뷰')
    .style(style_head);
  ws2
    .cell(1, 5)
    .string('작성자')
    .style(style_head);
  ws2.column(1).setWidth(10);
  ws2.column(2).setWidth(15);
  ws2.column(3).setWidth(60);
  ws2.column(4).setWidth(100);
  ws2.column(5).setWidth(30);
  ws2
    .row(1)
    .setHeight(30)
    .filter();

  const data = await getApi(url);
  const data_anroid = data.filter(val => {
    return val.os === 'android';
  });
  if (data_anroid.length > 0) {
    data_anroid.forEach((data, i) => {
      let num = i + 2;
      let review = data.review;
      ws1
        .cell(num, 1)
        .string(review.score.toString())
        .style(style_right);
      ws1
        .cell(num, 2)
        .string(review.date)
        .style(style_right);
      ws1.cell(num, 3).string(review.text);
      ws1
        .cell(num, 4)
        .string(review.userName)
        .style(style_right);
    });
  } else {
    ws1.row(2).setHeight(80);
    ws1
      .cell(2, 1, 2, 4, true)
      .string('조회된 리뷰가 없습니다.')
      .style(style_center);
  }

  const data_ios = data.filter(val => {
    return val.os === 'ios';
  });
  if (data_ios.length > 0) {
    data_ios.forEach((data, i) => {
      let num = i + 2;
      let review = data.review;
      ws2
        .cell(num, 1)
        .string(review.rate)
        .style(style_right);
      ws2
        .cell(num, 2)
        .string(review.updated)
        .style(style_right);
      ws2.cell(num, 3).string(review.title);
      ws2.cell(num, 4).string(review.comment);
      ws2
        .cell(num, 5)
        .string(review.author)
        .style(style_right);
    });
  } else {
    ws2.row(2).setHeight(80);
    ws2
      .cell(2, 1, 2, 5, true)
      .string('조회된 리뷰가 없습니다.')
      .style(style_center);
  }

  // 엑셀 저장
  wb.write(`public/${file}`, (err, stats) => {
    if (err) {
      console.error(err);
    } else {
      return res.send({ file, stats });
    }
  });
});

/**
 * GET 리뷰 조회 (몇일부터 몇일까지 조회)
 * /reviews/사이트/from/to/운영체제
 * example: /reviews/hmall/20190301/20190313/android
 */
route.get('/reviews/:site/:from?/:to?/:os?', async (req, res) => {
  const site = req.params.site;
  const today = moment()
    .startOf('day')
    .format();
  const end = moment()
    .endOf('day')
    .format();
  const prevday = moment(end)
    .subtract(1, 'days')
    .format();
  const from =
    req.params.from !== undefined
      ? moment(req.params.from, 'YYYYMMDD')
          .tz('Asia/Seoul')
          .format()
      : prevday;
  const to =
    req.params.to !== undefined
      ? req.params.to !== 'today'
        ? moment(req.params.to, 'YYYYMMDD')
            .tz('Asia/Seoul')
            .format()
        : end
      : end;
  const os = req.params.os;
  const options = {
    date: {
      $gte: from,
      $lte: to
    }
  };
  if (os) {
    options.os = os;
  }

  console.log('today:', today);
  console.log('end:', end);
  console.log('prevday:', prevday);
  console.log('options', options);

  const queryResult = await Review[site]
    .find(options, err => {
      if (err) return res.status(401).send(`DB Error: ${err}`);
    })
    .sort({ date: -1 });

  res.send(queryResult);
});

/**
 * POST api 조회, 상세 리뷰 같이 조회
 * req.body : { details, review_android, review_ios }
 * example: /
 */
route.post('/', async (req, res) => {
  const data = req.body;
  const details = await getApi(localhost + data.details);
  const review_android = await getApi(localhost + data.review_android);
  const review_ios = await getApi(localhost + data.review_ios);
  res.send({ details, review_android, review_ios });
});

/**
 * TODO
 * 구글플레이 및 앱스토어의 appId 유효한지 체크
 * /validation/appid/com.hmallapp/870397981
 * example: /validation/appid/안드로이드앱아이디/앱스토어앱아이디
 */
route.get('/validation/appid/:androidAppId/:appStoreId', (req, res) => {
  const androidAppId = req.params.androidAppId;
  const appStoreId = req.params.appStoreId;

  console.log(androidAppId);
  console.log(parseInt(appStoreId, 10));

  //validationAppid({});

  res.send('validation');
});

/**
 * TODO
 * 신규 스크랩됬거나 업데이트된 리뷰 조회
 * android는 업데이트, ios는 수정을 하면 기존 리뷰는 지우고 새로 작성
 * 신규 또는 업데이트 된 스크랩 내용을 텔레그램으로 쏴주기
 * 구현방법은 추후 논의
 */

module.exports = route;
