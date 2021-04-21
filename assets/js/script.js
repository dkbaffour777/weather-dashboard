
var initialPageData = appInitialData()

// Render search history
var weatherHistory = []
var localWeatherHistory = JSON.parse(localStorage.getItem("localWeatherHistory")) 
if(localWeatherHistory){
    //console.log(localWeatherHistory)
    weatherHistory = localWeatherHistory
    weatherHistory.map(city => addVisitedCity(city))
}

function loadData(city) {
    // Reset all element data to their default values
    pageDataReset(initialPageData)

    currentWeatherData(city)
    fiveDayWeather(city)
}

// fetch the current weather data
function currentWeatherData(city) {
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city +"&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(weatherData){
        //console.log(weatherData)

        // Get the city info
        document.querySelector("#cw-name").textContent = weatherData.name
        document.querySelector("#cw-date").textContent = getWeatherDate(weatherData.dt)
        getWeatherIcon(weatherData.weather[0].icon, document.querySelector("#cw-icon"))

        document.querySelector("#temp").textContent = weatherData.main.temp_max + "°F"
        document.querySelector("#wind").textContent = weatherData.wind.speed + " MPH"
        document.querySelector("#hum").textContent = weatherData.main.humidity + "%"
        getUV(weatherData.coord.lon, weatherData.coord.lat)

        // Save the city at the weather history section and the local storage
        saveWeatherHistory(weatherData.name)
    })
    .catch(function(){
        document.querySelector("#city-err").setAttribute("class", "err-msg")
        document.querySelector("#city-err").textContent = "City name '" + city + "', was not found or could not be loaded"
        pageDataReset(initialPageData)
    })
}

// UV index data
function getUV(lon, lat) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon+ "&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(uvData){
        var uvEl = document.querySelector("#uv")
        var uviValue = uvData.current.uvi
        uvEl.textContent = uviValue
        
        // Color code uv index
        if(uviValue >= 0 && uviValue <= 2) {
            uvEl.setAttribute("class", "minimal")
        } else if(uviValue >= 3 && uviValue <= 4) {
            uvEl.setAttribute("class", "low")
        } else if(uviValue >= 5 && uviValue <= 6) {
            uvEl.setAttribute("class", "moderate")
        } else if(uviValue >= 7 && uviValue <= 9) {
            uvEl.setAttribute("class", "high")
        } else if(uviValue >= 10) {
            uvEl.setAttribute("class", "very-high")
        }
    })
}

// Customized date
function getWeatherDate(unix_timeStamp) {
    var myDate = new Date(unix_timeStamp * 1000)
    var result = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()
    return result
}

// Icon code image link
function getWeatherIcon(iconCode, iconElCont) {
    iconElCont.innerHTML = ""
    var iconEl = document.createElement("img")
    iconEl.setAttribute("src", "https://openweathermap.org/img/wn/"+ iconCode +"@2x.png")
    
    iconElCont.append(iconEl)
    iconEl.style.width = "50px"
    iconEl.style.height = "100%"
}

// Render the five day weather elements
function renderFiveDayWeather(fiveDayData) {
    var fiveDayElCont = document.querySelector("#five-day-cont")

    fiveDayElCont.innerHTML = ""

    for (let i = 8; i <= fiveDayData.length; i += 8) {
        if(i === fiveDayData.length) i = fiveDayData.length - 1
        var fiveDayEl = document.createElement("div")
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
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + city +"&appid=a0722575280635660ac6cc42752f6d56&units=imperial")
    .then(function(res){
        return res.json()
    })
    .then(function(weatherData){
        renderFiveDayWeather(weatherData.list)
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

// Render visited city
function addVisitedCity(city) {
    // Create a new element and append it to the page
    var visitedCityEl = document.createElement("div")
    visitedCityEl.setAttribute("class", "visited-city")
    visitedCityEl.textContent = city
    document.querySelector("#weather-history").append(visitedCityEl)

}

// Save the cities searched
function saveWeatherHistory(city) {
    // Check if localWeatherHistory exists
    if(localStorage.getItem("localWeatherHistory")) {
        var weatherH = JSON.parse(localStorage.getItem("localWeatherHistory"))
        // Check if the city name is found in the array list
        if(weatherH.includes(city)) {
            return
        }
    }
    function save() {
        // Add the city to the visited city list
        addVisitedCity(city)

        // Store the search value in the local storage
        weatherHistory.push(city)
        localStorage.setItem("localWeatherHistory", JSON.stringify(weatherHistory))    
        console.log(weatherHistory)
    }
    save()
}

// Load the weather data when the search button is clicked
function loadSearchInpData(event) {
    event.preventDefault()
    var city = document.querySelector("#searchInp").value
    loadData(city)
}

function loadHistoryData(event) {
    if(event.target.matches(".visited-city")) {
        loadData(event.target.textContent)
    }
}

function removeErrMsg() {
    document.querySelector("#city-err").removeAttribute("class")
    document.querySelector("#city-err").textContent = ""
}

document.querySelector("#search-form").addEventListener("submit", loadSearchInpData)

document.querySelector("#weather-history").addEventListener("click", loadHistoryData)

document.querySelector("#searchInp").addEventListener("change", removeErrMsg)
