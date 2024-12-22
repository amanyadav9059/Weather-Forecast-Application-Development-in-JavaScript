document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const recentCitiesDropdown = document.getElementById('recent-cities');
    const extendedForecastContainer = document.getElementById('extended-forecast');

    const apiKey = '413ce672d42554809290dd800a80a652'; // Replace with your OpenWeatherMap API key
    const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Load recently searched cities from local storage
    function loadRecentCities() {
        const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        updateDropdown(recentCities);
    }

    // Save a city to local storage
    function saveCityToLocalStorage(city) {
        let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        if (!recentCities.includes(city)) {
            recentCities.unshift(city);
            if (recentCities.length > 5) recentCities.pop(); // Limit to 5 cities
            localStorage.setItem('recentCities', JSON.stringify(recentCities));
        }
    }

    // Update dropdown menu
    function updateDropdown(cities) {
        recentCitiesDropdown.innerHTML = '';
        if (cities.length > 0) {
            recentCitiesDropdown.classList.remove('hidden');
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                recentCitiesDropdown.appendChild(option);
            });
        } else {
            recentCitiesDropdown.classList.add('hidden');
        }
    }

    // Fetch weather data
    async function fetchWeatherData(query) {
        try {
            const response = await fetch(`${weatherUrl}?${query}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('Error fetching weather data.');
            const data = await response.json();
            displayWeather(data);

            if (query.startsWith('q=')) {
                const city = query.split('=')[1];
                saveCityToLocalStorage(city);
                loadRecentCities();
            }

            fetchExtendedForecast(query);
        } catch (error) {
            console.error(error);
            alert('Error fetching weather data.');
        }
    }

    // Fetch extended forecast
    async function fetchExtendedForecast(query) {
        try {
            const response = await fetch(`${forecastUrl}?${query}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('Error fetching extended forecast.');
            const data = await response.json();
            displayExtendedForecast(data.list);
        } catch (error) {
            console.error(error);
        }
    }

    // Display weather data
    function displayWeather(data) {
        weatherDisplay.classList.remove('hidden');
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('current-date').textContent = new Date().toLocaleDateString();
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        document.getElementById('current-temperature').textContent = `${data.main.temp}°C`;
        document.getElementById('current-description').textContent = data.weather[0].description;
    }

    // Display extended forecast
    function displayExtendedForecast(forecastData) {
        extendedForecastContainer.innerHTML = '';
        const dailyData = forecastData.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);

        dailyData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            const date = new Date(day.dt_txt).toLocaleDateString();
            const icon = day.weather[0].icon;
            const temp = day.main.temp;
            const wind = day.wind.speed;
            const humidity = day.main.humidity;

            card.innerHTML = `
                <p class="font-bold">${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon" class="mx-auto">
                <p>Temp: ${temp}°C</p>
                <p>Wind: ${wind} m/s</p>
                <p>Humidity: ${humidity}%</p>
            `;

            extendedForecastContainer.appendChild(card);
        });
    }

    // Event listeners
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) fetchWeatherData(`q=${city}`);
        else alert('Please enter a valid city name.');
    });

    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(`lat=${latitude}&lon=${longitude}`);
                },
                error => alert('Error retrieving location.')
            );
        } else {
            alert('Geolocation not supported by your browser.');
        }
    });

    recentCitiesDropdown.addEventListener('change', () => {
        const selectedCity = recentCitiesDropdown.value;
        if (selectedCity) fetchWeatherData(`q=${selectedCity}`);
    });

    // Initialize
    loadRecentCities();
});
