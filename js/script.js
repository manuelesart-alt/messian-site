/* ============================================
   FIREBASE REST API
   ============================================ */
const FIREBASE_DB = 'https://messian-site-default-rtdb.europe-west1.firebasedatabase.app';

async function fbGet(path) {
    try {
        const r = await fetch(`${FIREBASE_DB}/${path}.json`);
        if (!r.ok) return null;
        return await r.json();
    } catch { return null; }
}

/* ============================================
   СИСТЕМА ЯЗЫКОВ (i18n)
   ============================================ */
const i18n = {
    ru: {
        'contacts': 'Контакты',
        'back-home': '← На главную',
        'portfolio': 'Портфолио',
        'demos-card-title': 'Библиотека демок',
        'demos-card-desc': 'Оригинальные композиции, саундтреки и эксперименты',
        'demos-card-link': 'Слушать →',
        'films-card-title': 'Библиотека фильмов',
        'films-card-desc': 'Работы для кино, рекламы и медиа-проектов',
        'films-card-link': 'Смотреть →',
        'about-title': 'О себе',
        'education-title': 'Образование',
        'contact-title': 'Связаться со мной',
        'copyright': '© 2025 MESSIAN. Все права защищены.',
        'demos-hero-title': 'Библиотека демок',
        'demos-hero-sub': 'Нажмите на пластинку, чтобы послушать',
        'demos-hero-hint': '← прокручивайте →',
        'films-hero-title': 'Библиотека фильмов',
        'films-hero-sub': 'Музыка и звуковой дизайн для кино, рекламы и медиа',
        'video-coming': 'Видео скоро появится',
        'loading-video': 'Загрузка видео...',
        'load-error': 'Не удалось загрузить видео',
        'open-yadisk': 'Открыть на Яндекс Диске →',
        'bad-gdrive': 'Неверная ссылка Google Drive',
        'open-gdrive': 'Открыть в Google Drive →',
    },
    en: {
        'contacts': 'Contacts',
        'back-home': '← Back to home',
        'portfolio': 'Portfolio',
        'demos-card-title': 'Demo Library',
        'demos-card-desc': 'Original compositions, soundtracks, and experiments',
        'demos-card-link': 'Listen →',
        'films-card-title': 'Film Library',
        'films-card-desc': 'Works for cinema, advertising, and media projects',
        'films-card-link': 'Watch →',
        'about-title': 'About',
        'education-title': 'Education',
        'contact-title': 'Get in touch',
        'copyright': '© 2025 MESSIAN. All rights reserved.',
        'demos-hero-title': 'Demo Library',
        'demos-hero-sub': 'Click on a vinyl to listen',
        'demos-hero-hint': '← scroll →',
        'films-hero-title': 'Film Library',
        'films-hero-sub': 'Music and sound design for cinema, advertising, and media',
        'video-coming': 'Video coming soon',
        'loading-video': 'Loading video...',
        'load-error': 'Failed to load video',
        'open-yadisk': 'Open on Yandex Disk →',
        'bad-gdrive': 'Invalid Google Drive link',
        'open-gdrive': 'Open in Google Drive →',
    }
};

function getCurrentLang() {
    return localStorage.getItem('site-lang') || 'ru';
}

function t(key) {
    const lang = getCurrentLang();
    return (i18n[lang] && i18n[lang][key]) || key;
}

function setLanguage(lang) {
    localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });

    document.querySelectorAll('[data-en]').forEach(el => {
        if (!el.hasAttribute('data-ru')) {
            el.setAttribute('data-ru', el.textContent);
        }
        el.textContent = lang === 'en'
            ? el.getAttribute('data-en')
            : el.getAttribute('data-ru');
    });

    document.querySelectorAll('.lang-switch').forEach(sw => {
        sw.querySelector('.lang-switch__ru').classList.toggle('active', lang === 'ru');
        sw.querySelector('.lang-switch__en').classList.toggle('active', lang === 'en');
    });

    document.querySelectorAll('.film-card').forEach(card => {
        const catEl = card.querySelector('.film-card__category');
        if (catEl) {
            const en = lang === 'en';
            catEl.textContent = (en && card.getAttribute('data-category-en')) || card.getAttribute('data-category');
        }
    });
}

/* ============================================
   РЕНДЕРИНГ КОНТЕНТА ИЗ FIREBASE
   ============================================ */

function renderAbout(data) {
    if (!data) return;
    const nameEl = document.querySelector('.about__text h3');
    const roleEl = document.querySelector('.about__role');
    const bioEl = document.querySelector('.about__bio');
    const photoEl = document.querySelector('.about__photo-img');
    const eduList = document.querySelector('.about__education ul');

    if (nameEl) {
        nameEl.textContent = data.name || '';
        if (data.nameEn) nameEl.setAttribute('data-en', data.nameEn);
    }
    if (roleEl) {
        roleEl.textContent = data.role || '';
        if (data.roleEn) roleEl.setAttribute('data-en', data.roleEn);
    }
    if (bioEl) {
        bioEl.textContent = data.bio || '';
        if (data.bioEn) bioEl.setAttribute('data-en', data.bioEn);
    }
    if (photoEl && data.photo) {
        photoEl.src = data.photo;
    }
    if (eduList && data.education) {
        const items = Array.isArray(data.education) ? data.education : Object.values(data.education);
        eduList.innerHTML = items.map(e => `
            <li>
                <span class="year">${e.year || ''}</span>
                <span class="place"${e.placeEn ? ` data-en="${e.placeEn}"` : ''}>${e.place || ''}</span>
            </li>
        `).join('');
    }
}

function renderContacts(data) {
    if (!data) return;
    const container = document.querySelector('.footer__contacts');
    if (!container) return;

    const icons = { email: '✉', telegram: '✈', instagram: '📷', soundcloud: '☁', youtube: '▶', vimeo: '🎬' };
    const labels = { email: '', telegram: 'Telegram', instagram: 'Instagram', soundcloud: 'SoundCloud', youtube: 'YouTube', vimeo: 'Vimeo' };

    let html = '';
    if (data.email) html += `<a href="mailto:${data.email}" class="footer__link"><span class="footer__icon">${icons.email}</span>${data.email}</a>`;
    ['telegram','instagram','soundcloud','youtube','vimeo'].forEach(k => {
        if (data[k]) html += `<a href="${data[k]}" target="_blank" class="footer__link"><span class="footer__icon">${icons[k]}</span>${labels[k]}</a>`;
    });
    container.innerHTML = html;
}

function renderFilms(films) {
    const container = document.querySelector('.films-grid__inner');
    if (!container || !films) return;

    const items = Array.isArray(films) ? films : Object.values(films);
    container.innerHTML = items.map(f => `
        <article class="film-card"
                 data-title="${f.title || ''}"
                 ${f.titleEn ? `data-title-en="${f.titleEn}"` : ''}
                 data-year="${f.year || ''}"
                 data-category="${f.category || ''}"
                 ${f.categoryEn ? `data-category-en="${f.categoryEn}"` : ''}
                 data-role="${f.role || ''}"
                 ${f.roleEn ? `data-role-en="${f.roleEn}"` : ''}
                 data-desc="${(f.desc || '').replace(/"/g, '&quot;')}"
                 ${f.descEn ? `data-desc-en="${f.descEn.replace(/"/g, '&quot;')}"` : ''}
                 data-video="${f.video || ''}">
            <div class="film-card__poster">
                <img src="${f.poster || 'assets/images/film1.jpg'}" alt="${f.title || ''}">
                <div class="film-card__hover">
                    <div class="film-card__play-icon">▶</div>
                    <span class="film-card__category">${f.category || ''}</span>
                </div>
            </div>
            <div class="film-card__info">
                <h3 class="film-card__title"${f.titleEn ? ` data-en="${f.titleEn}"` : ''}>${f.title || ''}</h3>
                <span class="film-card__year">${f.year || ''}</span>
            </div>
        </article>
    `).join('');
}

function renderDemos(demos) {
    const container = document.querySelector('.vinyl-track');
    if (!container || !demos) return;

    const items = Array.isArray(demos) ? demos : Object.values(demos);
    container.innerHTML = items.map(d => `
        <div class="vinyl-item" data-audio="${d.audio || ''}">
            <div class="vinyl-sleeve">
                <img src="${d.cover || 'assets/images/album1.jpg'}" alt="${d.title || ''}" class="vinyl-sleeve__img">
            </div>
            <div class="vinyl-disc">
                <div class="vinyl-disc__grooves"></div>
                <div class="vinyl-disc__label">
                    <img src="${d.cover || 'assets/images/album1.jpg'}" alt="" class="vinyl-disc__label-img">
                </div>
                <div class="vinyl-disc__hole"></div>
            </div>
            <div class="vinyl-info">
                <span class="vinyl-info__title">${d.title || ''}</span>
                <span class="vinyl-info__duration">${d.duration || ''}</span>
                <p class="vinyl-info__desc"${d.descEn ? ` data-en="${d.descEn}"` : ''}>${d.desc || ''}</p>
            </div>
            <div class="vinyl-progress">
                <div class="vinyl-progress__bar"></div>
            </div>
        </div>
    `).join('');
}

/* ============================================
   ВИНИЛОВЫЙ ПЛЕЕР (инициализация)
   ============================================ */
let currentAudio = null;
let currentItem = null;
let progressInterval = null;

function initVinylPlayer() {
    const vinylItems = document.querySelectorAll('.vinyl-item');
    vinylItems.forEach(item => {
        const progressWrap = item.querySelector('.vinyl-progress');
        const progressBar = item.querySelector('.vinyl-progress__bar');

        item.addEventListener('click', (e) => {
            if (e.target.closest('.vinyl-progress')) return;
            const audioSrc = item.getAttribute('data-audio');

            if (currentItem === item) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    item.classList.add('playing');
                    startProgress(currentAudio, progressBar);
                } else {
                    currentAudio.pause();
                    item.classList.remove('playing');
                    stopProgress();
                }
                return;
            }

            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentItem.classList.remove('playing');
                currentItem.classList.remove('returning');
                currentItem.querySelector('.vinyl-progress__bar').style.width = '0%';
                stopProgress();
            }

            currentAudio = new Audio(audioSrc);
            currentItem = item;
            item.classList.add('returning');

            setTimeout(() => {
                item.classList.remove('returning');
                item.classList.add('playing');
                currentAudio.play()
                    .then(() => startProgress(currentAudio, progressBar))
                    .catch(() => item.classList.remove('playing'));
            }, 800);

            currentAudio.addEventListener('ended', () => {
                item.classList.remove('playing', 'returning');
                progressBar.style.width = '0%';
                stopProgress();
                currentAudio = null;
                currentItem = null;
            });
        });

        if (progressWrap) {
            progressWrap.addEventListener('click', (e) => {
                if (!currentAudio || currentItem !== item) return;
                e.stopPropagation();
                const rect = progressWrap.getBoundingClientRect();
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = x / rect.width;
                if (currentAudio.duration) {
                    currentAudio.currentTime = percent * currentAudio.duration;
                    progressBar.style.width = (percent * 100) + '%';
                }
            });
        }
    });
}

function startProgress(audio, bar) {
    stopProgress();
    progressInterval = setInterval(() => {
        if (audio.duration) {
            bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
        }
    }, 100);
}

function stopProgress() {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}

/* ============================================
   ПОПАП ФИЛЬМОВ (инициализация)
   ============================================ */
function initFilmPopup() {
    const filmCards = document.querySelectorAll('.film-card');
    const filmPopup = document.getElementById('filmPopup');
    if (!filmPopup) return;

    const popupOverlay = filmPopup.querySelector('.film-popup__overlay');
    const popupClose = filmPopup.querySelector('.film-popup__close');
    const playerContainer = document.getElementById('playerContainer');
    const popupTitle = document.getElementById('popupTitle');
    const popupYear = document.getElementById('popupYear');
    const popupCategory = document.getElementById('popupCategory');
    const popupRole = document.getElementById('popupRole');
    const popupDesc = document.getElementById('popupDesc');

    function getVideoType(url) {
        if (!url || url.trim() === '') return 'none';
        if (url.includes('vimeo.com')) return 'vimeo';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
        if (url.includes('disk.yandex')) return 'yandex';
        if (url.includes('drive.google.com')) return 'gdrive';
        return 'local';
    }
    function getVimeoId(url) { const m = url.match(/vimeo\.com\/(\d+)/); return m ? m[1] : null; }
    function getYoutubeId(url) { const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/); return m ? m[1] : null; }
    function getGdriveId(url) { let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/); if (m) return m[1]; m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/); return m ? m[1] : null; }

    function showLoading() {
        playerContainer.innerHTML = `<div class="film-popup__no-video"><span class="film-popup__no-video-icon">⏳</span><span>${t('loading-video')}</span></div>`;
    }

    function buildLocalPlayer(directUrl) {
        playerContainer.innerHTML = `<video controls preload="metadata"><source src="${directUrl}" type="video/mp4"></video><button class="film-popup__fullscreen" id="fullscreenBtn" title="Fullscreen">⛶</button>`;
        attachFullscreen();
    }

    function attachFullscreen() {
        const fsBtn = document.getElementById('fullscreenBtn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (playerContainer.requestFullscreen) playerContainer.requestFullscreen();
                else if (playerContainer.webkitRequestFullscreen) playerContainer.webkitRequestFullscreen();
            });
        }
    }

    function loadYandexVideo(publicUrl) {
        showLoading();
        fetch('https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=' + encodeURIComponent(publicUrl))
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { if (data.href) buildLocalPlayer(data.href); else throw new Error(); })
            .catch(() => {
                playerContainer.innerHTML = `<div class="film-popup__no-video"><span class="film-popup__no-video-icon">⚠</span><span>${t('load-error')}</span><a href="${publicUrl}" target="_blank" style="color:var(--accent);font-size:14px;margin-top:8px">${t('open-yadisk')}</a></div>`;
            });
    }

    function buildPlayer(videoUrl) {
        const type = getVideoType(videoUrl);
        if (type === 'vimeo') {
            const id = getVimeoId(videoUrl);
            playerContainer.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><button class="film-popup__fullscreen" id="fullscreenBtn" title="Fullscreen">⛶</button>`;
            attachFullscreen();
        } else if (type === 'youtube') {
            const id = getYoutubeId(videoUrl);
            playerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?rel=0" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe><button class="film-popup__fullscreen" id="fullscreenBtn" title="Fullscreen">⛶</button>`;
            attachFullscreen();
        } else if (type === 'yandex') {
            loadYandexVideo(videoUrl);
        } else if (type === 'gdrive') {
            const gid = getGdriveId(videoUrl);
            if (gid) {
                playerContainer.innerHTML = `<iframe src="https://drive.google.com/file/d/${gid}/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                filmPopup.classList.add('gdrive');
            } else {
                playerContainer.innerHTML = `<div class="film-popup__no-video"><span class="film-popup__no-video-icon">⚠</span><span>${t('bad-gdrive')}</span><a href="${videoUrl}" target="_blank" style="color:var(--accent);font-size:14px;margin-top:8px">${t('open-gdrive')}</a></div>`;
            }
        } else if (type === 'local') {
            buildLocalPlayer(videoUrl);
        } else {
            playerContainer.innerHTML = `<div class="film-popup__no-video"><span class="film-popup__no-video-icon">🎬</span><span>${t('video-coming')}</span></div>`;
        }
    }

    function clearPlayer() {
        const video = playerContainer.querySelector('video');
        if (video) { video.pause(); video.currentTime = 0; }
        playerContainer.innerHTML = '';
    }

    function closeFilmPopup() {
        filmPopup.classList.remove('active', 'gdrive');
        clearPlayer();
        document.body.style.overflow = '';
    }

    filmCards.forEach(card => {
        card.addEventListener('click', () => {
            const en = getCurrentLang() === 'en';
            popupTitle.textContent = (en && card.getAttribute('data-title-en')) || card.getAttribute('data-title');
            popupYear.textContent = card.getAttribute('data-year');
            popupCategory.textContent = (en && card.getAttribute('data-category-en')) || card.getAttribute('data-category');
            popupRole.textContent = (en && card.getAttribute('data-role-en')) || card.getAttribute('data-role');
            popupDesc.textContent = (en && card.getAttribute('data-desc-en')) || card.getAttribute('data-desc');
            buildPlayer(card.getAttribute('data-video'));
            filmPopup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    popupClose.addEventListener('click', closeFilmPopup);
    popupOverlay.addEventListener('click', closeFilmPopup);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filmPopup.classList.contains('active')) closeFilmPopup();
    });
}

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {

    // Language switcher
    document.querySelectorAll('.lang-switch').forEach(sw => {
        sw.addEventListener('click', () => {
            setLanguage(getCurrentLang() === 'ru' ? 'en' : 'ru');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Horizontal scroll for vinyl gallery
    const gallery = document.querySelector('.vinyl-gallery');
    if (gallery) {
        gallery.addEventListener('wheel', (e) => {
            if (e.deltaY === 0) return;
            const maxScroll = gallery.scrollWidth - gallery.clientWidth;
            if (e.deltaY > 0 && gallery.scrollLeft >= maxScroll - 1) return;
            if (e.deltaY < 0 && gallery.scrollLeft <= 0) return;
            e.preventDefault();
            gallery.scrollLeft += e.deltaY * 3;
        }, { passive: false });
    }

    // Load Firebase data and render
    const isIndex = !!document.querySelector('.about');
    const isFilms = !!document.querySelector('.films-grid');
    const isDemos = !!document.querySelector('.vinyl-gallery');

    if (isIndex) {
        const [about, contacts] = await Promise.all([fbGet('about'), fbGet('contacts')]);
        if (about) renderAbout(about);
        if (contacts) renderContacts(contacts);
    }

    if (isFilms) {
        const films = await fbGet('films');
        if (films) renderFilms(films);
        initFilmPopup();
    } else {
        initFilmPopup();
    }

    if (isDemos) {
        const demos = await fbGet('demos');
        if (demos) renderDemos(demos);
        initVinylPlayer();
    } else {
        initVinylPlayer();
    }

    // Apply language AFTER all content is loaded
    setLanguage(getCurrentLang());
});
