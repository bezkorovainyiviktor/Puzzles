/**
 * GeoGuess Puzzle Module
 * Player sees a photo, then selects the location on a map.
 * Validates if the selected location is within 10km of the target.
 */

(function () {
    'use strict';

    // 20 GeoGuess Locations
    const LOCATIONS = [
        { lat: 48.8584, lng: 2.2945, img: 'https://wallpaperbat.com/img/494383-europe-landmarks-tower-in-paris-wallpaper.jpg', name: 'Ейфелева вежа, Франція' },
        { lat: 41.8902, lng: 12.4922, img: 'https://www.accordtour.com/UserFiles/tour_city_gallery/it/1134_Kolizey_Rim/01_colosseum-3012088_960_720.jpg', name: 'Колізей, Італія' },
        { lat: 27.1751, lng: 78.0421, img: 'https://romantravel.ua/wp-content/uploads/Indiya-Agra-Front-View-of-the-Taj-Mahal-1024x700.jpg', name: 'Тадж-Махал, Індія' },
        { lat: 40.4319, lng: 116.5704, img: 'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg', name: 'Велика Китайська стіна' },
        { lat: 40.6892, lng: -74.0445, img: 'https://tse4.mm.bing.net/th/id/OIP.tULaDyVsNziyz6y5q1fcLAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Статуя Свободи, США' },
        { lat: -13.1631, lng: -72.5450, img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Machu_Picchu%2C_Peru.jpg', name: 'Мачу-Пікчу, Перу' },
        { lat: -33.8568, lng: 151.2153, img: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Sydney_Australia._%2821339175489%29.jpg', name: 'Сіднейський оперний театр, Австралія' },
        { lat: 51.5007, lng: -0.1246, img: 'https://tse1.mm.bing.net/th/id/OIP.vJG3mtplVJ2dypX1gAhbiAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Біг-Бен, Велика Британія' },
        { lat: -22.9519, lng: -43.2105, img: 'https://th.bing.com/th/id/R.c3fe0faa5f9fadc00261d4324122b253?rik=8iItI%2fvdGMvdwA&pid=ImgRaw&r=0', name: 'Христос-Спаситель, Бразилія' },
        { lat: 35.3606, lng: 138.7274, img: 'https://discover.in.ua/uploads/illustrations/%D0%93%D0%BE%D1%80%D0%B0-%D0%A4%D1%83%D0%B4%D0%B7%D1%96.jpg', name: 'Гора Фудзі, Японія' },
        { lat: 29.9792, lng: 31.1342, img: 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg', name: 'Піраміди Гізи, Єгипет' },
        { lat: 51.1789, lng: -1.8262, img: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Stonehenge2007_07_30.jpg', name: 'Стоунхендж, Велика Британія' },
        { lat: 30.3285, lng: 35.4444, img: 'https://tse1.mm.bing.net/th/id/OIP.KsYAkcu3FheJ1yvBvjN8gQHaEk?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Петра, Йорданія' },
        { lat: 37.9715, lng: 23.7267, img: 'https://tse1.mm.bing.net/th/id/OIP.DzSq-3JhajNody6NAA4t4QHaE8?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Акрополь, Греція' },
        { lat: 25.1972, lng: 55.2744, img: 'https://th.bing.com/th/id/R.30541e9cdb5089fd7c0120016bd6491d?rik=9lQDbiZ2RzXWVw&pid=ImgRaw&r=0', name: 'Бурдж Халіфа, ОАЕ' },
        { lat: 37.8199, lng: -122.4783, img: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg', name: 'Міст Золоті Ворота, США' },
        { lat: 27.9881, lng: 86.9250, img: 'https://focus.ua/static/storage/thumbs/1088x/6/4a/50fd4ce4-1f7e00cd60652c0b76bb2fc7b00b84a6.png', name: 'Гора Еверест, Непал' },
        { lat: 34.9671, lng: 135.7727, img: 'https://tse3.mm.bing.net/th/id/OIP.yQJK2leVHI9OPBk5e13kagHaD4?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Фусімі Інарі, Японія' },
        { lat: 20.6843, lng: -88.5678, img: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Chichen_Itza_3.jpg', name: 'Чичен-Іца, Мексика' },
        { lat: 47.5576, lng: 10.7498, img: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Schloss_Neuschwanstein_2013.jpg', name: 'Замок Нойшванштайн, Німеччина' }
    ];
    let currentTarget = null;
    const WIN_RADIUS_KM = 5;

    let container = null;
    let onComplete = null;
    let map = null;
    let marker = null;
    let moves = 0; // In this context: number of guesses

    // DOM Elements
    let photoEl = null;
    let mapEl = null;
    let confirmBtn = null;
    let resultOverlay = null;

    // ── Helpers ──────────────────────────────────

    // ── Helpers ──────────────────────────────────

    /**
     * Haversine formula to calculate the great-circle distance between two points given their longitudes and latitudes
     * @returns Distance in kilometers
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // ── Game Logic ───────────────────────────────

    function handleMapClick(e) {
        const { lat, lng } = e.latlng;
        if (!marker) {
            marker = L.marker([lat, lng]).addTo(map);
            confirmBtn.disabled = false;
        } else {
            marker.setLatLng([lat, lng]);
        }
    }

    function handleConfirm() {
        if (!marker) return;
        moves++;

        const movesEl = container.querySelector('#gg-moves');
        if (movesEl) movesEl.innerHTML = T(String(moves));

        const userLat = marker.getLatLng().lat;
        const userLng = marker.getLatLng().lng;

        const distance = calculateDistance(currentTarget.lat, currentTarget.lng, userLat, userLng);

        if (distance <= WIN_RADIUS_KM) {
            handleWin(distance);
        } else {
            handleMiss(distance);
        }
    }

    function handleWin(dist) {
        // Show correct marker and line for visual feedback
        L.marker([currentTarget.lat, currentTarget.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        L.polyline([marker.getLatLng(), [currentTarget.lat, currentTarget.lng]], { color: 'green', weight: 3 }).addTo(map);
        map.fitBounds(L.polyline([marker.getLatLng(), [currentTarget.lat, currentTarget.lng]]).getBounds(), { padding: [50, 50] });

        confirmBtn.style.display = 'none';

        // Wait a moment for player to see the map before full win overlay 
        setTimeout(() => {
            if (onComplete) {
                // "Moves" here means attempts
                onComplete({ moves: moves });
            }
        }, 2000);
    }

    function handleMiss(dist) {
        // Show temporary error message
        resultOverlay.innerHTML = `<span>❌➡️ </span> ${T(dist.toFixed(1), false)} ${T('км', false)}`;
        resultOverlay.classList.add('active');

        setTimeout(() => {
            resultOverlay.classList.remove('active');
        }, 3000);
    }

    // ── Sub-Phase: Image -> Map ──────────────────

    function transitionToMap() {
        photoEl.classList.add('gg-photo--minimized');
        mapEl.classList.add('gg-map--active');

        // Leaflet needs a resize event if container changed size
        setTimeout(() => {
            map.invalidateSize();
        }, 400); // Wait for CSS transition
    }

    // ── Module Interface ─────────────────────────

    function init(containerEl, completeCb) {
        container = containerEl;
        onComplete = completeCb;
        moves = 0;
        currentTarget = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        container.innerHTML = `
            <header class="header">
                <h1 class="title">${T("GeoGuess")}</h1>
                <p class="subtitle">${T("Уважно подивіться на фотографію та знайдіть це місце на карті (до 5 км).")}</p>
            </header>
            
            <div class="stats-bar">
                <div class="stat">
                    <span class="stat__label">${T("Спроби")}</span>
                    <span class="stat__value" id="gg-moves">${T("0")}</span>
                </div>
            </div>

            <div class="gg-board-wrapper">
                <div class="gg-photo-container" id="gg-photo">
                    <img src="${currentTarget.img}" alt="" />
                    <button class="btn btn--primary gg-start-btn" id="gg-start-btn">${T("Я готовий вгадувати")}</button>
                    <div class="gg-photo-hint notranslate">Клікніть по фото, щоб розгорнути</div>
                </div>

                <div class="gg-map-container" id="gg-map"></div>
                
                <div class="gg-result-overlay" id="gg-result">${T("Промах!")}</div>
            </div>
            
            <div class="gg-controls">
                <button class="btn btn--primary btn--large" id="gg-confirm-btn" disabled>${T("Підтвердити вибір")}</button>
            </div>
        `;

        photoEl = container.querySelector('#gg-photo');
        mapEl = container.querySelector('#gg-map');
        confirmBtn = container.querySelector('#gg-confirm-btn');
        resultOverlay = container.querySelector('#gg-result');
        const startBtn = container.querySelector('#gg-start-btn');

        // Init map but don't show it yet
        map = L.map('gg-map', {
            center: [20, 0], // Center of world
            zoom: 2,
            minZoom: 2,
            maxBounds: [[-90, -180], [90, 180]]
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', handleMapClick);

        startBtn.addEventListener('click', transitionToMap);
        confirmBtn.addEventListener('click', handleConfirm);

        // Let user expand the minimized photo to look closer again
        photoEl.addEventListener('click', () => {
            if (photoEl.classList.contains('gg-photo--minimized')) {
                photoEl.classList.toggle('gg-photo--expanded-view');
            }
        });
    }

    function destroy() {
        if (map) {
            map.remove(); // Proper leaflet cleanup
            map = null;
        }
        marker = null;
        if (container) container.innerHTML = '';
    }

    // ── Register ─────────────────────────────────
    window.PuzzleRegistry.push({
        name: 'GeoGuess',
        init,
        destroy
    });

})();
