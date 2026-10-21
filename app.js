const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const tempValue = document.getElementById('temp-value');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const humidityValue = document.getElementById('humidity-value');
const rainValue = document.getElementById('rain-value');
const weatherInfo = document.getElementById('weather-info');
const searchButton = document.getElementById('search-button');

// La clave vive en config.js, que se carga antes que este archivo.
const API_KEY = window.OPENWEATHER_API_KEY;

if (!API_KEY) {
    console.warn('No se encontró la API key. Revisa config.js.');
}

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

weatherForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();
    if (city) {
        obtenerDatosClima(city);
    }
});

async function obtenerDatosClima(city) {
    if (!API_KEY) {
        mostrarError('Falta la API key. Revisa config.js.');
        return;
    }

    const params = `q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;

    setLoading(true);

    try {
        // La previsión solo aporta la probabilidad de lluvia; si falla, la app sigue.
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${WEATHER_URL}?${params}`),
            fetch(`${FORECAST_URL}?${params}&cnt=1`).catch(() => null)
        ]);

        if (weatherRes.status === 404) {
            throw new Error('Ciudad no encontrada');
        }

        if (!weatherRes.ok) {
            throw new Error(`No se pudo cargar el clima (HTTP ${weatherRes.status})`);
        }

        const data = await weatherRes.json();

        // El endpoint de previsión es el que devuelve la probabilidad de lluvia (pop).
        let pop = null;
        if (forecastRes && forecastRes.ok) {
            const forecast = await forecastRes.json();
            pop = forecast.list?.[0]?.pop ?? null;
        }

        mostrarDatosClima(data, pop);
    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);

        const mensaje = error instanceof TypeError
            ? 'No se pudo conectar. Revisa tu conexión'
            : error.message;

        mostrarError(mensaje);
    } finally {
        setLoading(false);
    }
}

const mostrarDatosClima = (data, pop) => {
    const weather = data.weather?.[0];

    cityName.textContent = data.name;
    tempValue.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = capitalizar(weather?.description ?? 'Sin datos');

    if (weather?.icon) {
        weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        weatherIcon.alt = weather.description ?? '';
        weatherIcon.hidden = false;

        // Reinicia la animación para que el icono se refresque en cada búsqueda.
        weatherIcon.classList.remove('icon-appear');
        void weatherIcon.offsetWidth;
        weatherIcon.classList.add('icon-appear');
    } else {
        weatherIcon.hidden = true;
        weatherIcon.removeAttribute('src');
    }

    humidityValue.textContent = `${data.main.humidity}%`;
    rainValue.textContent = pop === null ? '--%' : `${Math.round(pop * 100)}%`;

    // sunrise y sunset vienen en UTC (segundos), igual que dt.
    const esDeDia = data.sys?.sunrise && data.sys?.sunset
        ? data.dt >= data.sys.sunrise && data.dt < data.sys.sunset
        : weather?.icon?.endsWith('d') ?? false;

    aplicarTema(esDeDia);
};

const mostrarError = (mensaje) => {
    cityName.textContent = mensaje;
    tempValue.textContent = '--';
    weatherDescription.textContent = 'Sin datos';
    weatherIcon.hidden = true;
    weatherIcon.removeAttribute('src');
    weatherIcon.classList.remove('icon-appear');
    humidityValue.textContent = '--%';
    rainValue.textContent = '--%';
};

const setLoading = (loading) => {
    weatherForm.classList.toggle('is-loading', loading);
    searchButton.disabled = loading;
    weatherInfo.setAttribute('aria-busy', String(loading));

    if (loading) {
        weatherDescription.textContent = 'Buscando…';
    }
};

const aplicarTema = (esDeDia) => {
    document.body.classList.toggle('theme-night', !esDeDia);
};

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Antes de la primera búsqueda usamos la hora local como aproximación.
const horaLocal = new Date().getHours();
aplicarTema(horaLocal >= 6 && horaLocal < 20);
