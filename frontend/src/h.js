const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".localizacion-btn");
const currentWeatherDiv = document.querySelector(".clima-actual");
const weatherCardsDiv = document.querySelector(".weather-cards")

const API_KEY = "871b2ceba132a9a0fd1e3166643fadb1";

const createWeatherCard = (cityName , weatherItem, index) =>{
    if(index === 0){//html principal temperatura
        return `<div class="detalle">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperatura: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icono">
                <img src= "https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`
    }else{//html de los 5 dias (tarjetas) 
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src= "https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`
    }
    
}

const obtenerDetallesClima = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {

        const uniqueForescastDays = [];
        const fiveDaysForescast = data.list.filter(forescast => {
            const forescastDate = new Date(forescast.dt_txt).getDate();
            if(!uniqueForescastDays.includes(forescastDate)){
                return uniqueForescastDays.push(forescastDate);
            }
        });

        //limpieza de campos, remplaza los campos basios y los rellena con la peticion a la API
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        // console.log(fiveDaysForescast);
        fiveDaysForescast.forEach((weatherItem, index) => {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() =>{
        alert ('Ocurio un error en el fetch de la busqueda');
    });
}

const obtenerCordenadasCiudad = () =>{//bien
    const cityName = cityInput.value.trim(); //bien
    if(!cityName) return;//bien
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;//bien

    fetch(GEOCODING_API_URL)//bien
    .then(res => res.json())
    .then(data =>{
        if(!data.length) return alert(`No hay cordenadas para ${cityName}`);//bien
        const {name, lat, lon} = data[0];
        obtenerDetallesClima(name, lat, lon);
    }).catch(() =>{
        alert ('Ocurio un error en el fetch de cordenadas');
    });
}

// const obtenerCoordenadasCiudad = () => {
//     const cityName = cityInput.value.trim();
//     if (!cityName) return;
//     const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

//     $.ajax({
//         url: GEOCODING_API_URL,
//         method: 'GET',
//         dataType: 'json',
//         success: (data) => {
//             if (!data.length) return alert(`No hay coordenadas para ${cityName}`);
//             const { name, lat, lon } = data[0];
//             obtenerDetallesClima(name, lat, lon);
//         },
//         error: () => {
//             alert('Ocurrió un error en la solicitud de coordenadas');
//         },
//     });
// }


const obtenerUbicacionUsuario = () =>{
    navigator.geolocation.getCurrentPosition(
            position => {
                const {latitude, longitude} = position.coords;
                const REVERSE_GEOCODEING = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=&appid=${API_KEY}`;
                fetch(REVERSE_GEOCODEING)//bien
                .then(res => res.json())
                .then(data =>{
                    const {name} = data[0];
                    obtenerDetallesClima(name, latitude, longitude);
                }).catch(() =>{
                    alert ('Ocurio un error en la busqueda de la ciudad');
                });
            },
            error => {
                if(error.code === error.PERMISSION_DENIED){
                    alter("Geolocalizacion denegada. Porfavor reiniciar y permitir el acceso a su locaclización nuevamente");
                }    
            }
    );
}

locationButton.addEventListener("click", obtenerUbicacionUsuario)
searchButton.addEventListener("click", obtenerCordenadasCiudad);
cityInput.addEventListener("keyup", e => e.key === "Enter" && obtenerCordenadasCiudad());