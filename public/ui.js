$(function() {
  // details
  $.ajax({
    method: 'GET',
    url: '/api/details',
    contentType: 'application/json',
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {
      var android = [];
      for (var key in data.android) {
        android.push('<li><span>' + key + '</span> : ' + data.android[key] + '</li>');
      }
      $('.details.android').append(android.join(''));

      var ios = [];
      for (var key in data.ios) {
        ios.push('<li><span>' + key + '</span> : ' + data.ios[key] + '</li>');
      }
      $('.details.ios').append(ios.join(''));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR.responseText);
    }
  });

  /*
  <div class="_review"><div class="_star"><img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점">
<img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점">
<img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점"><span>점수</span> : 5</div><div class="_subject">제목이 제목이지 제목이 제목이겠냐</div><div class="_content">좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~</div><div class="_comment"><img src="https://cdn0.iconfinder.com/data/icons/faticons-2/31/comment21-512.png" alt=""></div><div class="_info"><span>아이디 : </span> hyundaihmall / <span>날짜 : </span>2019. 2. 9</div></div>
  */
  // reviews android
  $.ajax({
    method: 'GET',
    url: '/api/reviews/20190201/today/android',
    contentType: 'application/json',
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {
      var reviews = '';
      for (var i = 0; i < data.length; i++) {
        var review = '';
        reviews += `<li><div class="_review"><div class="_star"><img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점">
        <img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점">
        <img src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678064-star-512.png" alt="3점"><span>점수</span> : 5</div><div class="_subject">제목이 제목이지 제목이 제목이겠냐</div><div class="_content">좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~ 좋은 상품을 소개해주셔서 늘 애용하고있읍니다~~ 고마워요~</div><div class="_comment"><img src="https://cdn0.iconfinder.com/data/icons/faticons-2/31/comment21-512.png" alt=""></div><div class="_info"><span>아이디 : </span> hyundaihmall / <span>날짜 : </span>2019. 2. 9</div></div></li>`;
        // review += '<ul>';
        // review += '<li><span>운영체제</span> : ' + data[i].os + '</li>';
        // review += '<li><span>유저명</span> : ' + data[i].review.userName + '</li>';
        // review += '<li><span>날짜</span> : ' + data[i].review.date + '</li>';
        // review += '<li><span>점수</span> : ' + data[i].review.score + '</li>';
        // review += '<li><span>제목</span> : ' + data[i].review.title + '</li>';
        // review += '<li><span>내용</span> : ' + data[i].review.text + '</li>';
        // review += '<li><span>답글날짜</span> : ' + data[i].review.replyDate + '</li>';
        // review += '<li><span>답글내용</span> : ' + data[i].review.replyText + '</li>';
        // review += '</ul>';
        // reviews += '<li>' + review + '</li>';
      }
      $('.reviews.android').append(reviews);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR.responseText);
    }
  });

  // reviews ios
  $.ajax({
    method: 'GET',
    url: '/api/reviews/20190201/today/ios',
    contentType: 'application/json',
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {
      var reviews = '';
      for (var i = 0; i < data.length; i++) {
        var review = '';
        review += '<ul>';
        review += '<li><span>운영체제</span> : ' + data[i].os + '</li>';
        review += '<li><span>유저명</span> : ' + data[i].review.author + '</li>';
        review += '<li><span>날짜</span> : ' + data[i].review.updated + '</li>';
        review += '<li><span>점수</span> : ' + data[i].review.rate + '</li>';
        review += '<li><span>제목</span> : ' + data[i].review.title + '</li>';
        review += '<li><span>내용</span> : ' + data[i].review.comment + '</li>';
        review += '</ul>';
        reviews += '<li>' + review + '</li>';
      }
      $('.reviews.ios').append(reviews);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(jqXHR.responseText);
    }
  });
});