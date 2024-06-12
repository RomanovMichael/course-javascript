import { formTemplate } from './templates';
import './yandex.css';
import './yandex.html';

document.addEventListener('DOMContentLoaded', () => {
  ymaps.ready(init);
});

let clusterer;

function init() {
  const myMap = new ymaps.Map('map', {
    center: [55.76, 37.64],
    controls: ['zoomControl'],
    zoom: 12,
  });
  clusterer = new ymaps.Clusterer({ clusterDisableClickZoom: true });
  clusterer.options.set('hasBalloon', false);
  clusterer.events.add('click', (e) => {
    const geoObjectsInClusterer = e.get('target').getGeoObjects();
    openBalloon(myMap, e.get('coords'), geoObjectsInClusterer);
  });
  renderGeoObjects(myMap);

  myMap.events.add('click', function (e) {
    const coords = e.get('coords');

    openBalloon(myMap, coords, []);
  });
}

function getReviewsFromLS() {
  const reviews = localStorage.reviews;

  return JSON.parse(reviews || '[]');
}

function getReviewList(currentGeoObjects) {
  let reviewListHTML = '';
  for (const review of getReviewsFromLS()) {
    if (
      currentGeoObjects.some(
        (geoObject) =>
          JSON.stringify(geoObject.geometry._coordinates) ===
          JSON.stringify(review.coords)
      )
    ) {
      reviewListHTML += `
      <div class="review">
        <div>Место: ${review.place}</div>
        <div>Имя:  ${review.author}</div>
        <div>Отзыв: ${review.reviewText}</div>
      </div>
      `;
    }
  }
  return reviewListHTML;
}

function renderGeoObjects(map) {
  const geoObjects = [];
  for (const review of getReviewsFromLS()) {
    const placemark = new ymaps.Placemark(review.coords);
    placemark.events.add('click', (e) => {
      e.stopPropagation();
      openBalloon(map, e.get('coords'), [e.get('target')]);
    });
    geoObjects.push(placemark);
  }
  clusterer.removeAll();
  map.geoObjects.remove(clusterer);
  clusterer.add(geoObjects);
  map.geoObjects.add(clusterer);
}
async function openBalloon(map, coords, currentGeoObjects) {
  await map.balloon.open(coords, {
    content:
      `<div class="reviews">${getReviewList(currentGeoObjects)}</div>` + formTemplate,
  });
  document.querySelector('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const review = {
      coords,
      author: this.elements.author.value,
      place: this.elements.place.value,
      reviewText: this.elements.reviewText.value,
    };

    localStorage.reviews = JSON.stringify([...getReviewsFromLS(), review]);

    renderGeoObjects(map);

    map.balloon.close();
  });
}
