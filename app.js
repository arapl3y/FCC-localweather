//Add functionality to use geolocation if using chrome
//Chrome 50 geolocation bug
//Add 5 day forecast

/*

-Not reading global variables, because part of run function?
    -cTemp, fTemp, tempSwap, skycons, d, h, m
-Can we make convertTemp function stand alone outside of getWeather()?
-Refactor skycons section
-IP API sometimes bringing up wrong location, Pyrmont -> Auburn etc.

*/

// //Preload fade in
$(document).ready(function() {

    $(".preload").fadeOut(2000, function() {
        $(".content").fadeIn(1000);
    });

    //Global time variables
    var m, h, d;

    //Skycons
    var skycons = new Skycons({
        "color": "black"
    });
    skycons.add("weather-icon", Skycons.CLEAR_DAY);
    skycons.play();

    //Get Data
    getIp();
    showTime();

    function getIp() {
        var getIpUrl = "https://ipapi.co/json/";

        $.getJSON(getIpUrl).then(function(location) {
            $('.currentLocation').text(location.city + ', ' + location.region + ", " + location.country);
            //Call weather function after IP located
            getWeather(location);

        }, function error(err) {
            if (error.status.fail) {
                alert(error.status.message);
            }
        });
    }

    function getWeather(location) {
        //Assign IP API location data to variables
        var lat = location.latitude;
        var lon = location.longitude;

        var weatherApi = "c1ce9d512a69e69adeb90b4a243590a9";
        var getWeatherUrl = "https://cors-anywhere.herokuapp.com/" +
            "http://api.openweathermap.org/data/2.5/weather?lat=" + lat +
            "&lon=" + lon + "&units=metric&appid=" + weatherApi;

        //Get weather
        $.getJSON(getWeatherUrl).then(function(weather) {
                var tempSwap = false;

                //Set variables for Celsius and Fahrenheit
                var cTemp = weather.main.temp;
                var fTemp = (cTemp * (9 / 5)) + 32;

                //Set default temp
                $('.currentTemp').text(Math.round(cTemp) + "°C");

                //Temperature conversion
                $('#convertTemp').click(function() {
                    if (tempSwap === true) {
                        $('.currentTemp').text(Math.round(cTemp) + "°C").hide().fadeIn();
                        $('.btn').text("/°F");
                        tempSwap = false;
                    } else {
                        $('.currentTemp').text(Math.round(fTemp * 10) / 10 + "°F").hide().fadeIn();
                        $('.btn').text("/°C");
                        tempSwap = true;
                    }
                });

                //Weather descriptions
                var weatherDesc = weather.weather[0].description;

                $('.currentCondition').text(weatherDesc);

                //Dynamic weather icons
                if (weatherDesc.indexOf("rain") >= 0) {
                    skycons.set("weather-icon", Skycons.RAIN);
                } else if (weatherDesc.indexOf("sunny") >= 0) {
                    skycons.set("weather-icon", Skycons.CLEAR_DAY);
                } else if (weatherDesc.indexOf("clear") >= 0) {
                    skycons.set("weather-icon", Skycons.CLEAR_DAY);
                } else if (h <= 7 && h > 20) {
                    skycons.set("weather-icon", Skycons.CLEAR_NIGHT);
                } else if (weatherDesc.indexOf("cloud") >= 0) {
                    if (h >= 7 && h < 20) {
                        skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_DAY);
                    } else {
                        skycons.set("weather-icon", Skycons.PARTLY_CLOUDY_NIGHT);
                    }
                } else if (weatherDesc.indexOf("thunderstorm") >= 0) {
                    skycons.set("weather-icon", Skycons.SLEET);
                } else if (weatherDesc.indexOf("snow") >= 0) {
                    skycons.set("weather-icon", Skycons.SNOW);
                }
            },
            function error(err) {
                console.log("Error");
            });
    }

    //Day and time
    function showTime() {
        //Clock variables
        var date = new Date();
        var h = date.getHours();
        var m = date.getMinutes();
        var d = date.getDay();
        var daylist = ["Sunday", "Monday", "Tuesday", "Wednesday ", "Thursday", "Friday", "Saturday"];
        var session = "AM";

        if (h > 12) {
            session = "PM";
        }

        //Add a 0 before digit to keep consistency
        h = (h < 10) ? "0" + h : h;
        m = (m < 10) ? "0" + m : m;

        var time = daylist[d] + ", " + h + ":" + m + " " + session;

        $("#clock").text(time);

        setTimeout(showTime, 1000);

        //Change background depending on time
        if (h > 16 && h < 20) {
            $('body').css("background", "linear-gradient(to bottom, #0B486B, #F56217)");
        } else if (h >= 20 || h < 5) {
            $('body').css("background", "linear-gradient(to bottom, #141E30 , #243B55)");
        } else if (h >= 5 && h < 8) {
            $('body').css("background", "linear-gradient(to bottom, #FF512F, #F09819)");
        } else {
            $('body').css("background", "linear-gradient(to bottom, #4CA1AF, #C4E0E5)");
        }
    }
});
