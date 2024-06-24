import axios from 'axios';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const API_KEY = '44548622-5fd69a61f42bc3e999cbd3ef1';
let query = '';
let page = 1;
const perPage = 40;
let totalHits = 0;
let lightbox;

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  query = event.target.searchQuery.value.trim();
  page = 1;
  gallery.innerHTML = '';
  loadMoreButton.style.visibility = 'hidden';

  if (query === '') {
    iziToast.warning({ title: 'Warning', message: 'Please enter a search query.' });
    return;
  }

  try {
    const response = await fetchImages(query, page, perPage);
    totalHits = response.totalHits;
    if (totalHits === 0) {
      iziToast.info({ title: 'Info', message: 'Sorry, there are no images matching your search query. Please try again.' });
      return;
    }
    iziToast.success({ title: 'Success', message: `Hooray! We found ${totalHits} images.` });
    renderImages(response.hits);
    if (response.hits.length < perPage) {
      iziToast.info({ title: 'Info', message: "We're sorry, but you've reached the end of search results." });
    } else {
      loadMoreButton.style.visibility = 'visible';
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Failed to fetch images. Please try again later.' });
  }
});

loadMoreButton.addEventListener('click', async () => {
  page += 1;
  try {
    const response = await fetchImages(query, page, perPage);
    renderImages(response.hits, true);
    if (page * perPage >= totalHits) {
      loadMoreButton.style.visibility = 'hidden';
      iziToast.info({ title: 'Info', message: "We're sorry, but you've reached the end of search results." });
    }
  } catch (error) {
    iziToast.error({ title: 'Error', message: 'Failed to load images. Please try again later.' });
  }
});

async function fetchImages(query, page, perPage) {
  const response = await axios.get('https://pixabay.com/api/', {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: perPage,
    },
  });
  return response.data;
}

function renderImages(images, shouldScroll = false) {
  const markup = images.map(image => {
    return `
      <div class="photo-card">
        <a href="${image.largeImageURL}" class="gallery-link">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b> ${image.likes}</p>
          <p class="info-item"><b>Views</b> ${image.views}</p>
          <p class="info-item"><b>Comments</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
        </div>
      </div>
    `;
  }).join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
  } else {
    lightbox.refresh();
  }
  if (shouldScroll) {
    smoothScroll();
  }
}

function smoothScroll() {
  const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
