# App del Tiempo ⛅

Una app sencilla para consultar el tiempo de una ciudad. La hice como proyecto de aprendizaje para practicar **HTML, CSS y JavaScript** sin frameworks.

**Demo:** https://sburgos28.github.io/app-tiempo/

![Demo de la App del Tiempo: búsqueda de Barcelona y Tokyo](assets/demo.gif)

## ¿Qué hace?

- Busca el tiempo de una ciudad por su nombre.
- Muestra la temperatura, la descripción y un icono.
- Muestra la humedad y la probabilidad de lluvia.
- Cambia el fondo entre día y noche según la hora de la ciudad.
- Muestra un spinner mientras espera la respuesta de la API.

## Tecnologías

- HTML5
- CSS3
- JavaScript (vanilla, sin frameworks)
- [OpenWeatherMap API](https://openweathermap.org/api)

## Cómo ejecutarlo

1. Clona el repositorio:

   ```bash
   git clone https://github.com/sburgos28/app-tiempo.git
   cd app-tiempo
   ```

2. Abre `index.html` en el navegador. No hace falta servidor local ni configurar nada.

## Estructura del proyecto

```
app-tiempo/
├── assets/
│   └── demo.gif    # Demo animada
├── index.html      # Estructura de la página
├── style.css       # Estilos (día/noche, spinner, tarjetas...)
├── app.js          # Lógica y peticiones a la API
├── config.js       # API key de OpenWeatherMap
├── LICENSE
└── README.md
```

## Notas

- La API key está en `config.js`. Es una clave gratuita de OpenWeatherMap.
- Si aparece "Ciudad no encontrada", revisa que el nombre de la ciudad esté bien escrito.
- Si sale un error con `HTTP 401`, probablemente la API key no esté activa.

## Cosas que me gustaría añadir

- [ ] Previsión de los próximos días.
- [ ] Botón para cambiar entre °C y °F.
- [ ] Geolocalización para cargar el tiempo actual.
- [ ] Guardar la última ciudad buscada.
- [ ] Mostrar más datos: viento, sensación térmica...

## Autor

Proyecto de aprendizaje hecho por [sburgos28](https://github.com/sburgos28).

## Licencia

Este proyecto está bajo la licencia MIT. Consulta [LICENSE](LICENSE).
