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

    // Update film card hover categories when language changes
    document.querySelectorAll('.film-card').forEach(card => {
        const catEl = card.querySelector('.film-card__category');
        if (catEl) {
            const en = lang === 'en';
            catEl.textContent = (en && card.getAttribute('data-category-en')) || card.getAttribute('data-category');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // Language initialization
    setLanguage(getCurrentLang());
    document.querySelectorAll('.lang-switch').forEach(sw => {
        sw.addEventListener('click', () => {
            setLanguage(getCurrentLang() === 'ru' ? 'en' : 'ru');
        });
    });

    /* ============================================
       ВИНИЛОВЫЙ ПЛЕЕР
       ============================================ */
    const vinylItems = document.querySelectorAll('.vinyl-item');

    let currentAudio = null;
    let currentItem = null;
    let progressInterval = null;

    vinylItems.forEach(item => {
        const progressWrap = item.querySelector('.vinyl-progress');
        const progressBar = item.querySelector('.vinyl-progress__bar');

        // === Клик по пластинке (кроме прогресс-бара) ===
        item.addEventListener('click', (e) => {
            if (e.target.closest('.vinyl-progress')) return;

            const audioSrc = item.getAttribute('data-audio');

            // Та же пластинка — пауза / продолжить
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

            // Останавливаем предыдущую
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentItem.classList.remove('playing');
                currentItem.classList.remove('returning');
                currentItem.querySelector('.vinyl-progress__bar').style.width = '0%';
                stopProgress();
            }

            // Запускаем новую
            currentAudio = new Audio(audioSrc);
            currentItem = item;

            item.classList.add('returning');

            setTimeout(() => {
                item.classList.remove('returning');
                item.classList.add('playing');

                currentAudio.play()
                    .then(() => {
                        startProgress(currentAudio, progressBar);
                    })
                    .catch(err => {
                        console.error('Ошибка воспроизведения:', err);
                        item.classList.remove('playing');
                    });
            }, 800);

            currentAudio.addEventListener('ended', () => {
                item.classList.remove('playing');
                item.classList.remove('returning');
                progressBar.style.width = '0%';
                stopProgress();
                currentAudio = null;
                currentItem = null;
            });
        });

        // === Клик по прогресс-бару — перемотка ===
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

    // === Прогресс ===
    function startProgress(audio, bar) {
        stopProgress();
        progressInterval = setInterval(() => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                bar.style.width = percent + '%';
            }
        }, 100);
    }

    function stopProgress() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    /* ============================================
       ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
       ============================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ============================================
       ГОРИЗОНТАЛЬНЫЙ СКРОЛЛ КОЛЕСОМ МЫШИ
       ============================================ */
    const gallery = document.querySelector('.vinyl-gallery');
    if (gallery) {
        gallery.addEventListener('wheel', (e) => {
            if (e.deltaY === 0) return;

            const maxScroll = gallery.scrollWidth - gallery.clientWidth;
            const atStart = gallery.scrollLeft <= 0;
            const atEnd = gallery.scrollLeft >= maxScroll - 1;

            if (e.deltaY > 0 && atEnd) return;
            if (e.deltaY < 0 && atStart) return;

            e.preventDefault();
            gallery.scrollLeft += e.deltaY * 3;

        }, { passive: false });
    }

    /* ============================================
       ПОПАП ФИЛЬМОВ
       ============================================ */
    const filmCards = document.querySelectorAll('.film-card');
    const filmPopup = document.getElementById('filmPopup');

    if (filmPopup) {
        const popupOverlay = filmPopup.querySelector('.film-popup__overlay');
        const popupClose = filmPopup.querySelector('.film-popup__close');
        const playerContainer = document.getElementById('playerContainer');

        const popupTitle = document.getElementById('popupTitle');
        const popupYear = document.getElementById('popupYear');
        const popupCategory = document.getElementById('popupCategory');
        const popupRole = document.getElementById('popupRole');
        const popupDesc = document.getElementById('popupDesc');

        // Определяем тип видео
        function getVideoType(url) {
            if (!url || url.trim() === '') return 'none';
            if (url.includes('vimeo.com')) return 'vimeo';
            if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
            if (url.includes('disk.yandex')) return 'yandex';
            if (url.includes('drive.google.com')) return 'gdrive';
            return 'local';
        }

        // Извлекаем ID из Vimeo URL
        function getVimeoId(url) {
            const match = url.match(/vimeo\.com\/(\d+)/);
            return match ? match[1] : null;
        }

        // Извлекаем ID из YouTube URL
        function getYoutubeId(url) {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
            return match ? match[1] : null;
        }

        // Извлекаем ID из Google Drive URL
        function getGdriveId(url) {
            let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (match) return match[1];
            match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            return match ? match[1] : null;
        }

        function showLoading() {
            playerContainer.innerHTML = `
                <div class="film-popup__no-video">
                    <span class="film-popup__no-video-icon">⏳</span>
                    <span>${t('loading-video')}</span>
                </div>
            `;
        }

        // Создать локальный / прямой видеоплеер
        function buildLocalPlayer(directUrl) {
            playerContainer.innerHTML = `
                <video controls preload="metadata">
                    <source src="${directUrl}" type="video/mp4">
                </video>
                <button class="film-popup__fullscreen" id="fullscreenBtn" title="На весь экран">⛶</button>
            `;
            attachFullscreen();
        }

        // Привязать кнопку fullscreen
        function attachFullscreen() {
            const fsBtn = document.getElementById('fullscreenBtn');
            if (fsBtn) {
                fsBtn.addEventListener('click', () => {
                    if (playerContainer.requestFullscreen) {
                        playerContainer.requestFullscreen();
                    } else if (playerContainer.webkitRequestFullscreen) {
                        playerContainer.webkitRequestFullscreen();
                    }
                });
            }
        }

        // Получить прямую ссылку с Яндекс Диска
        function loadYandexVideo(publicUrl) {
            showLoading();

            const apiUrl = 'https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=' + encodeURIComponent(publicUrl);

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Ошибка загрузки');
                    return response.json();
                })
                .then(data => {
                    if (data.href) {
                        buildLocalPlayer(data.href);
                    } else {
                        throw new Error('Нет ссылки');
                    }
                })
                .catch(err => {
                    console.error('Яндекс Диск ошибка:', err);
                    playerContainer.innerHTML = `
                        <div class="film-popup__no-video">
                            <span class="film-popup__no-video-icon">⚠</span>
                            <span>${t('load-error')}</span>
                            <a href="${publicUrl}" target="_blank" style="color: var(--accent); font-size: 14px; margin-top: 8px;">
                                ${t('open-yadisk')}
                            </a>
                        </div>
                    `;
                });
        }

        // Создаём плеер
        function buildPlayer(videoUrl) {
            const type = getVideoType(videoUrl);

            if (type === 'vimeo') {
                const id = getVimeoId(videoUrl);
                playerContainer.innerHTML = `
                    <iframe
                        src="https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                    <button class="film-popup__fullscreen" id="fullscreenBtn" title="На весь экран">⛶</button>
                `;
                attachFullscreen();

            } else if (type === 'youtube') {
                const id = getYoutubeId(videoUrl);
                playerContainer.innerHTML = `
                    <iframe
                        src="https://www.youtube.com/embed/${id}?rel=0"
                        allow="autoplay; fullscreen; encrypted-media"
                        allowfullscreen>
                    </iframe>
                    <button class="film-popup__fullscreen" id="fullscreenBtn" title="На весь экран">⛶</button>
                `;
                attachFullscreen();

            } else if (type === 'yandex') {
                loadYandexVideo(videoUrl);

            } else if (type === 'gdrive') {
                const gid = getGdriveId(videoUrl);
                if (gid) {
                    playerContainer.innerHTML = `
                        <iframe
                            src="https://drive.google.com/file/d/${gid}/preview"
                            allow="autoplay; fullscreen"
                            allowfullscreen>
                        </iframe>
                    `;
                    filmPopup.classList.add('gdrive');
                } else {
                    playerContainer.innerHTML = `
                        <div class="film-popup__no-video">
                            <span class="film-popup__no-video-icon">⚠</span>
                            <span>${t('bad-gdrive')}</span>
                            <a href="${videoUrl}" target="_blank" style="color: var(--accent); font-size: 14px; margin-top: 8px;">
                                ${t('open-gdrive')}
                            </a>
                        </div>
                    `;
                }

            } else if (type === 'local') {
                buildLocalPlayer(videoUrl);

            } else {
                playerContainer.innerHTML = `
                    <div class="film-popup__no-video">
                        <span class="film-popup__no-video-icon">🎬</span>
                        <span>${t('video-coming')}</span>
                    </div>
                `;
            }
        }

        // Очищаем плеер
        function clearPlayer() {
            const video = playerContainer.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            playerContainer.innerHTML = '';
        }

        // Открыть попап
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

        // Закрыть попап
        function closeFilmPopup() {
            filmPopup.classList.remove('active');
            filmPopup.classList.remove('gdrive');
            clearPlayer();
            document.body.style.overflow = '';
        }

        popupClose.addEventListener('click', closeFilmPopup);
        popupOverlay.addEventListener('click', closeFilmPopup);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && filmPopup.classList.contains('active')) {
                closeFilmPopup();
            }
        });
    }

});