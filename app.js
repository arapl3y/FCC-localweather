var app = {};

app.init = function() {
  app.celsius = 0;
  app.fahrenheit = 0;
  app.showCelsius = true;
  app.initSkycons();
  app.showTime();
  app.getLocation();
  setInterval(app.showTime, 1000);

  //Temperature conversion
  $('#convertTemp').on("click", app.convertTemp);
};

app.convertTemp = function() {
  if (app.showCelsius === true) {
    app.showCelsius = false;
  } else {
    app.showCelsius = true;
  }
  app.render();
};

app.initSkycons = function() {
  app.skycons = new Skycons({
    "color": "black"
  });

  app.skycons.add("weather-icon", Skycons.CLEAR_DAY);
  app.skycons.play();
};

//get weather at coordinates
app.getLocation = function() {
  //JSON call to get location (lat,lon)
  //on success => app.getWeather(location)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      app.getWeather(lat, lon);

    });
  } else {
    $.getJSON("https://ipapi.co/json/").then(function(location) {
      var lat = location.latitude;
      var lon = location.longitude;
      app.getWeather(lat, lon);

    }, function error(err) {
      if (error.status.fail) {
        alert(error.status.message);
      }
    });
  }
};

//get weather at coordinates
app.getWeather = function(lat, lon) {
  //JSON call to get weather using lat,lon
  //on success => display weather
  var weatherApi = "c1ce9d512a69e69adeb90b4a243590a9";
  var getWeatherUrl = "https://cors-anywhere.herokuapp.com/" +
    "http://api.openweathermap.org/data/2.5/weather?lat=" + lat +
    "&lon=" + lon + "&units=metric&appid=" + weatherApi;

  //Get weather data
  $.getJSON(getWeatherUrl).then(function(weather) {
      app.weather = {
        celsius: weather.main.temp,
        sunrise: weather.sys.sunrise,
        sunset: weather.sys.sunset,
        description: weather.weather[0].description,
        city: weather.name
      };

      app.render();
    },
    function error(err) {
      console.log("Error");
    });
};

app.render = function() {
  var w = app.weather;

  //app.fahrenheit = (app.celsius * (9 / 5)) + 32;
  if (app.showCelsius) {
    $('.currentTemp').text(Math.round(w.celsius) + "°C").hide().fadeIn();

    $('#convertTemp').text("Convert to /°F");
  } else {
    var fahrenheit = w.celsius * (9 / 5) + 32;
    var rounded = Math.round(fahrenheit * 10) / 10;

    $('.currentTemp').text(rounded + "°F").hide().fadeIn();
    $('#convertTemp').text("Convert to /°C");
  }

  //Display location
  $('.currentLocation').text(w.city);


  //Weather descriptions
  $('.currentCondition').text(w.description);

  //Dynamic weather icons
  var currentTime = new Date().getTime() / 1000;
  var isDaytime = currentTime > w.sunrise && currentTime < w.sunset;
  var desc = w.description.toLowerCase();

  if (desc.indexOf("rain") >= 0) {
    app.skycons.set("weather-icon", Skycons.RAIN);
  } else if (desc.indexOf("sunny") >= 0 && isDaytime) {
    app.skycons.set("weather-icon", Skycons.CLEAR_DAY);
  } else if (desc.indexOf("sunny") >= 0 && !isDaytime) {
    app.skycons.set("weather-icon", Skycons.CLEAR_NIGHT);
  } else if (desc.indexOf("cloud") >= 0 && isDaytime) {
    app.skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_DAY);
  } else if (desc.indexOf("cloud") >= 0 && !isDaytime) {
    app.skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_NIGHT);
  } else if (desc.indexOf("thunderstorm") >= 0) {
    app.skycons.set("weather-icon", Skycons.SLEET);
  } else if (desc.indexOf("snow") >= 0) {
    app.skycons.set("weather-icon", Skycons.SNOW);
  } else {
    app.skycons.set("weather-icon", Skycons.CLEAR_DAY);
  }
};

app.showTime = function() {
  //Clock variables
  var date = new Date();
  var h = date.getHours();
  var m = date.getMinutes();
  var d = date.getDay();
  var daylist = ["Sunday", "Monday", "Tuesday", "Wednesday ", "Thursday", "Friday", "Saturday"];
  var session = "AM";
  var greeting = $('#greeting');

  if (h >= 12) {
    session = "PM";
  }

  //Add a 0 before digit to keep consistency
  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;

  var time = daylist[d] + ", " + h + ":" + m + " " + session;

  $("#clock").text(time);

  //Change background depending on time
  if (h > 16 && h < 20) {
    $('body').css("background", "linear-gradient(to bottom, #0B486B, #F56217)");
    greeting.text("afternoon");
  } else if (h >= 20 || h < 5) {
    $('body').css("background", "linear-gradient(to bottom, #141E30 , #243B55)");
    greeting.text("evening");
  } else if (h >= 5 && h < 8) {
    $('body').css("background", "linear-gradient(to bottom, #FF512F, #F09819)");
    greeting.text("morning");
  } else {
    $('body').css("background", "linear-gradient(to bottom, #4CA1AF, #C4E0E5)");
    greeting.text("morning");
  }
};

$(document).ready(app.init);
