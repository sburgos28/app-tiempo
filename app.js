/*
    App del Tiempo - lógica principal
    ---------------------------------
    1. Escucha el formulario de búsqueda.
    2. Pide los datos a OpenWeatherMap con fetch.
    3. Pinta temperatura, icono, humedad y probabilidad de lluvia.
    4. Cambia el fondo entre día y noche.
*/

// --- Referencias a los elementos del HTML ---
// Las guardamos en constantes para no buscarlas cada vez que las usamos.
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

// --- Configuración de la API ---
// La clave está en config.js para no publicarla en GitHub.
// Si ves un aviso en la consola, crea ese archivo a partir de config.example.js.
const API_KEY = window.OPENWEATHER_API_KEY;

if (!API_KEY) {
    console.warn('Falta config.js. Copia config.example.js a config.js y añade tu API key de OpenWeatherMap.');
}

const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// --- Evento del formulario ---
weatherForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue.

    const city = cityInput.value.trim(); // Quita espacios sobrantes.
    if (city) {
        obtenerDatosClima(city);
    }
});

// --- Petición a la API ---
async function obtenerDatosClima(city) {
    // encodeURIComponent evita problemas con espacios, tildes o símbolos.
    const params = `q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;

    setLoading(true); // Muestra el spinner mientras esperamos.

    try {
        // Hacemos las dos peticiones a la vez para que tarden menos.
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(`${WEATHER_URL}?${params}`),
            // La previsión no es crítica: si falla, la app sigue funcionando.
            fetch(`${FORECAST_URL}?${params}&cnt=1`).catch(() => null)
        ]);

        // 404 = la ciudad no existe o está mal escrita.
        if (weatherRes.status === 404) {
            throw new Error('Ciudad no encontrada');
        }

        // Cualquier otro error HTTP (401, 429, 500...).
        if (!weatherRes.ok) {
            throw new Error(`No se pudo cargar el clima (HTTP ${weatherRes.status})`);
        }

        const data = await weatherRes.json();

        // La probabilidad de lluvia (pop) solo la da el endpoint de previsión.
        let pop = null;
        if (forecastRes && forecastRes.ok) {
            const forecast = await forecastRes.json();
            pop = forecast.list?.[0]?.pop ?? null;
        }

        mostrarDatosClima(data, pop);
    } catch (error) {
        console.error('Error al obtener los datos del clima:', error);

        // Un TypeError normalmente significa que no hay conexión.
        const mensaje = error instanceof TypeError
            ? 'No se pudo conectar. Revisa tu conexión'
            : error.message;

        mostrarError(mensaje);
    } finally {
        // Pase lo que pase, quitamos el estado de carga.
        setLoading(false);
    }
}

// --- Pintar los datos en pantalla ---
const mostrarDatosClima = (data, pop) => {
    cityName.textContent = data.name;
    tempValue.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;

    // OpenWeatherMap devuelve un código de icono (ej: 04n).
    // Ese código ya indica si es de día (d) o de noche (n).
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    weatherIcon.hidden = false;

    // Reiniciamos la animación para que el icono se "refresque" en cada búsqueda.
    weatherIcon.classList.remove('icon-appear');
    void weatherIcon.offsetWidth; // Truco para forzar que la animación se reinicie.
    weatherIcon.classList.add('icon-appear');

    humidityValue.textContent = `${data.main.humidity}%`;
    rainValue.textContent = pop === null ? '--%' : `${Math.round(pop * 100)}%`;

    // sunrise y sunset vienen en UTC (segundos), igual que dt,
    // así que se pueden comparar directamente sin importar la zona horaria.
    const esDeDia = data.sys?.sunrise && data.sys?.sunset
        ? data.dt >= data.sys.sunrise && data.dt < data.sys.sunset
        : data.weather[0].icon.endsWith('d');

    aplicarTema(esDeDia);
};

// --- Mostrar un error en la tarjeta ---
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

// --- Estado de carga ---
const setLoading = (loading) => {
    weatherForm.classList.toggle('is-loading', loading);
    searchButton.disabled = loading; // Evita enviar dos veces la misma búsqueda.
    weatherInfo.setAttribute('aria-busy', String(loading));

    if (loading) {
        weatherDescription.textContent = 'Buscando…';
    }
};

// --- Tema día / noche ---
const aplicarTema = (esDeDia) => {
    // Si NO es de día, añadimos la clase theme-night al body.
    document.body.classList.toggle('theme-night', !esDeDia);
};

// Al abrir la página todavía no sabemos la ciudad, así que usamos la hora local.
// De 6:00 a 20:00 lo consideramos "de día".
const horaLocal = new Date().getHours();
aplicarTema(horaLocal >= 6 && horaLocal < 20);

/*
    FUTURO (ideas para seguir practicando):
    - Guardar la última ciudad en localStorage y cargarla al abrir.
    - Botón para cambiar entre °C y °F.
    - Geolocalización con navigator.geolocation.
    - Previsión de varios días con el endpoint forecast.
    - Mostrar viento, sensación térmica, presión...
    - Añadir aria-live a la tarjeta para que los lectores de pantalla
      anuncien los cambios.
*/
