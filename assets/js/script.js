
var initialPageData = appInitialData()

// Render search history
var weatherHistory = []
var localWeatherHistory = JSON.parse(localStorage.getItem("localWeatherHistory")) 
if(localWeatherHistory){
    console.log(localWeatherHistory)
}

function loadData(city) {
    // Reset all element data to their default values
    pageDataReset(initialPageData)

    currentWeatherData(city)
    fiveDayWeather(city)
}

// fetch the current weather data
function currentWeatherData(city) {
    fetch("http://api.openweathermap.org/data/2.5/weather?q=" + city +"&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(weatherData){
        //console.log(weatherData)

        // Get the city name, date and icon
        document.querySelector("#cw-name").textContent = weatherData.name
        document.querySelector("#cw-date").textContent = getWeatherDate(weatherData.dt)
        getWeatherIcon(weatherData.weather[0].icon, document.querySelector("#cw-icon"))

        document.querySelector("#temp").textContent = weatherData.main.temp_max + "°F"
        document.querySelector("#wind").textContent = weatherData.wind.speed + " MPH"
        document.querySelector("#hum").textContent = weatherData.main.humidity + "%"
        getUV(weatherData.coord.lon, weatherData.coord.lat)
    })
    .catch(function(error){
        alert("City not found")
        pageDataReset(initialPageData)
    })
}

function getWeatherIcon(iconCode, iconElCont) {
    var iconEl = document.createElement("img")
    iconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+ iconCode +"@2x.png")
    
    iconElCont.append(iconEl)
    iconEl.style.width = "50px"
    iconEl.style.height = "100%"
}

function getUV(lon, lat) {
    fetch("http://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon+ "&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(uvData){
        document.querySelector("#uv").textContent = uvData.value
    })
    .catch(function(error){
        alert(error)
    })
}

function getWeatherDate(unix_timeStamp) {
    var myDate = new Date(unix_timeStamp * 1000)
    var result = myDate.getMonth() + "/" + myDate.getDate() + "/" + myDate.getFullYear()
    return result
}

function renderFiveDayWeather(fiveDayData) {
    var fiveDayElCont = document.querySelector("#five-day-cont")
    var fiveDayEl = null

    
    for (let i = 8; i <= fiveDayData.length; i += 8) {
        if(i === fiveDayData.length) i = fiveDayData.length - 1
        console.log(i)
        fiveDayEl = document.createElement("div")
        fiveDayEl.setAttribute("class", "fw")
        fiveDayEl.innerHTML = `
        <h4 class="fw-date">` + getWeatherDate(fiveDayData[i].dt) + `</h4>
        <div class="fw-icon"></div>
        <div class="fw-info">Temp: <span id="fw-temp">` + fiveDayData[i].main.temp_max + `°F</span></div>
        <div class="fw-info">Wind: <span id="fw-wind">` + fiveDayData[i].wind.speed + ` MPH</span></div>
        <div class="fw-info">Humidity: <span id="fw-hum">` + fiveDayData[i].main.humidity + `%</span></div>
        `
        fiveDayElCont.append(fiveDayEl)
    }


    var fwIcon = document.querySelectorAll(".fw-icon")

    for (let i = 0; i < fwIcon.length; i++) {
        getWeatherIcon(fiveDayData[i].weather[0].icon, fwIcon[i])
    }
}

// 5 day weather forecast
function fiveDayWeather(city) {
    fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + city +"&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(weatherData){
        console.log(weatherData)
        renderFiveDayWeather(weatherData.list)
    })
    .catch(function(error){
        alert(error)
    })
}

// Get the inner HTML of all elements that have 
// data that needs to be reset
function appInitialData() {
    var initialPageDataEl = document.querySelectorAll(".initial-data")
    var initialPageDataValues = []
    for (let i = 0; i < initialPageDataEl.length; i++) {
        initialPageDataValues.push(initialPageDataEl[i].innerHTML)
    }
    return initialPageDataValues
}

// Reset the page data to the initial data
function pageDataReset(initialPageData) {
    var currentPageDataEl = document.querySelectorAll(".initial-data")
    for (let i = 0; i < currentPageDataEl.length; i++) {
        currentPageDataEl[i].innerHTML = initialPageData[i]
    }
}

// Load the weather data when the search button is clicked
function loadSearchInpData() {
    var city = document.querySelector("#searchInp").value
    loadData(city)
}

function loadHistoryData(event) {
    if(event.target.matches(".visited-city")) {
        loadData(event.target.textContent)
    }
}

document.querySelector("#searchBtn").addEventListener("click", loadSearchInpData)

document.querySelector("#weather-history").addEventListener("click", loadHistoryData)
