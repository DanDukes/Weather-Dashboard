$(document).ready(function() {
  (function() {
    var placesAutocomplete = places({
      appId: 'plFJFO1RQ0U3',
      apiKey: 'b168325d25570b419f75e808fc82785d',
      container: document.querySelector('#search-value'),
      templates: {
        value: function(suggestion) {
          return suggestion.name;
        }
      }
    }).configure({
      type: 'city',
      aroundLatLngViaIP: true,
    });
  })();

  $("#search-button").on("click", function() {
    let searchValue = $("#search-value").val();
    $("#search-value").val("");
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  const makeRow = (text) => {
    let li = $("<li>")
      .addClass("list-group-item list-group-item-action")
      .text(text);
    $(".history").append(li);
  }

  const getForecast = (searchValue) => {
    $.ajax({
      type: "GET",
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        searchValue +
        "&appid=adfa30d28992b81767460464c73f76b5&units=imperial",
      dataType: "json",
      success: (data) => {
        $("#forecast")
          .html('<h4 class="mt-3 bg-secondary">5-Day Forecast:</h4>')
          .append('<div class="row bg-secondary">');

        for (let i = 0; i < data.list.length; i++) {
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            let col = $("<div>").addClass("col-md-2");
            let card = $("<div>").addClass("card bg-info text-white");
            let body = $("<div>").addClass("card-body p-2");

            let title = $("<h5>")
              .addClass("card-title")
              .text(new Date(data.list[i].dt_txt).toLocaleDateString());

            let img = $("<img>").attr(
              "src",
              "http://openweathermap.org/img/w/" +
                data.list[i].weather[0].icon +
                ".png"
            );

            let p1 = $("<p>")
              .addClass("card-text")
              .text("Temp: " + data.list[i].main.temp_max + " °F");
            let p2 = $("<p>")
              .addClass("card-text")
              .text("Humidity: " + data.list[i].main.humidity + "%");

            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  const getUVIndex = (lat, lon) => {
    $.ajax({
      type: "GET",
      url:
        "https://api.openweathermap.org/data/2.5/uvi?appid=adfa30d28992b81767460464c73f76b5&lat=" +
        lat +
        "&lon=" +
        lon,
      dataType: "json",
      success: (data) => {
        let uv = $("<p>").text("UV Index: ");
        let btn = $("<a>")
          .addClass("btn btn-sm")
          .text(data.value)
          .attr("href", "https://www.epa.gov/sunsafety/uv-index-scale-0")
          .attr("target", "_blank");

        console.log(data.value);
        switch(true) {
          case  (data.value <3 ):
            btn.addClass("btn-success");
            break;
          case (data.value < 7):
            btn.addClass("btn-warning");
            break;
          case (data.value > 7):
            btn.addClass("btn-danger");
        }
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  const searchWeather = (searchValue) => {
    $.ajax({
      type: "GET",
      url:
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        searchValue +
        "&appid=adfa30d28992b81767460464c73f76b5&units=imperial",
      dataType: "json",
      success: (data) => {
        console.log(data);
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
          makeRow(searchValue);
        }
        $("#today").empty();

        let title = $("<h3>")
          .addClass("card-title bg-info")
          .text(data.name + " (" + new Date().toLocaleDateString() + ")");
        let conditions = $("<h5>")
        .addClass("card-title bg-info")
        .text("Condition: " + data.weather[0].main);
        let card = $("<div>").addClass("card");
        let wind = $("<p>")
          .addClass("card-text")
          .text("Wind Speed: " + data.wind.speed + " MPH");
        let humid = $("<p>")
          .addClass("card-text")
          .text("Humidity: " + data.main.humidity + "%");
        let temp = $("<p>")
          .addClass("card-text")
          .text("Temperature: " + data.main.temp + " °F");
        let feelsLike = $("<p>")
          .addClass("card-text")
          .text("Feels Like: " + data.main.feels_like + " °F");
        let max = $("<p>")
          .addClass("card-text")
          .text("Today's High: " + data.main.temp_max + " °F");
        let min = $("<p>")
          .addClass("card-text")
          .text("Today's Low: " + data.main.temp_min + " °F");
        let cardBody = $("<div>").addClass("card-body bg-info");
        let img = $("<img>").attr(
          "src",
          "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
        );

        title.append(img);
        cardBody.append(title, conditions, temp, feelsLike, max, min, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  let history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
