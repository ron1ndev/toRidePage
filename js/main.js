var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE ");
var isMobile = { Android: function () { return navigator.userAgent.match(/Android/i); }, BlackBerry: function () { return navigator.userAgent.match(/BlackBerry/i); }, iOS: function () { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, Opera: function () { return navigator.userAgent.match(/Opera Mini/i); }, Windows: function () { return navigator.userAgent.match(/IEMobile/i); }, any: function () { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); } };
function isIE() {
	ua = navigator.userAgent;
	var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
	return is_ie;
}
if (isIE()) {
	document.querySelector('html').classList.add('ie');
}
if (isMobile.any()) {
	document.querySelector('html').classList.add('_touch');
}

function testWebP(callback) {
	var webP = new Image();
	webP.onload = webP.onerror = function () {
		callback(webP.height == 2);
	};
	webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}
testWebP(function (support) {
	if (support === true) {
		document.querySelector('html').classList.add('_webp');
	} else {
		document.querySelector('html').classList.add('_no-webp');
	}
});

function ibg() {
	if (isIE()) {
		let ibg = document.querySelectorAll("._ibg");
		for (var i = 0; i < ibg.length; i++) {
			if (ibg[i].querySelector('img') && ibg[i].querySelector('img').getAttribute('src') != null) {
				ibg[i].style.backgroundImage = 'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
			}
		}
	}
}
ibg();

window.addEventListener("load", function () {
	if (document.querySelector('.wrapper')) {
		setTimeout(function () {
			document.querySelector('.wrapper').classList.add('_loaded');
		}, 0);
	}
});

let unlock = true;

//=================

//Menu
let iconMenu = document.querySelector(".icon-menu");
if (iconMenu != null) {
	let delay = 500;
	let menuBody = document.querySelector(".menu__body");
	iconMenu.addEventListener("click", function (e) {
		if (unlock) {
			body_lock(delay);
			iconMenu.classList.toggle("_active");
			menuBody.classList.toggle("_active");
		}
	});
};
function menu_close() {
	let iconMenu = document.querySelector(".icon-menu");
	let menuBody = document.querySelector(".menu__body");
	iconMenu.classList.remove("_active");
	menuBody.classList.remove("_active");
}
//=================
//BodyLock
function body_lock(delay) {
	let body = document.querySelector("body");
	if (body.classList.contains('_lock')) {
		body_lock_remove(delay);
	} else {
		body_lock_add(delay);
	}
}
function body_lock_remove(delay) {
	let body = document.querySelector("body");
	if (unlock) {
		let lock_padding = document.querySelectorAll("._lp");
		setTimeout(() => {
			for (let index = 0; index < lock_padding.length; index++) {
				const el = lock_padding[index];
				el.style.paddingRight = '0px';
			}
			body.style.paddingRight = '0px';
			body.classList.remove("_lock");
		}, delay);

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, delay);
	}
}
function body_lock_add(delay) {
	let body = document.querySelector("body");
	if (unlock) {
		let lock_padding = document.querySelectorAll("._lp");
		for (let index = 0; index < lock_padding.length; index++) {
			const el = lock_padding[index];
			el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		}
		body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		body.classList.add("_lock");

		unlock = false;
		setTimeout(function () {
			unlock = true;
		}, delay);
	}
}
//=================







//Popups
let popup_link = document.querySelectorAll('._popup-link');
let popups = document.querySelectorAll('.popup');
for (let index = 0; index < popup_link.length; index++) {
	const el = popup_link[index];
	el.addEventListener('click', function (e) {
		if (unlock) {
			let item = el.getAttribute('href').replace('#', '');
			let video = el.getAttribute('data-video');
			popup_open(item, video);
		}
		e.preventDefault();
	})
}
for (let index = 0; index < popups.length; index++) {
	const popup = popups[index];
	popup.addEventListener("click", function (e) {
		if (!e.target.closest('.popup__body')) {
			popup_close(e.target.closest('.popup'));
		}
	});
}
function popup_open(item, video = '') {
	let activePopup = document.querySelectorAll('.popup._active');
	if (activePopup.length > 0) {
		popup_close('', false);
	}
	let curent_popup = document.querySelector('.popup_' + item);
	if (curent_popup && unlock) {
		if (video != '' && video != null) {
			let popup_video = document.querySelector('.popup_video');
			popup_video.querySelector('.popup__video').innerHTML = '<iframe src="https://www.youtube.com/embed/' + video + '?autoplay=1"  allow="autoplay; encrypted-media" allowfullscreen></iframe>';
		}
		if (!document.querySelector('.menu__body._active')) {
			body_lock_add(500);
		}
		curent_popup.classList.add('_active');
		history.pushState('', '', '#' + item);
	}
}
function popup_close(item, bodyUnlock = true) {
	if (unlock) {
		if (!item) {
			for (let index = 0; index < popups.length; index++) {
				const popup = popups[index];
				let video = popup.querySelector('.popup__video');
				if (video) {
					video.innerHTML = '';
				}
				popup.classList.remove('_active');
			}
		} else {
			let video = item.querySelector('.popup__video');
			if (video) {
				video.innerHTML = '';
			}
			item.classList.remove('_active');
		}
		if (!document.querySelector('.menu__body._active') && bodyUnlock) {
			body_lock_remove(500);
		}
		history.pushState('', '', window.location.href.split('#')[0]);
	}
}
let popup_close_icon = document.querySelectorAll('.popup__close,._popup-close');
if (popup_close_icon) {
	for (let index = 0; index < popup_close_icon.length; index++) {
		const el = popup_close_icon[index];
		el.addEventListener('click', function () {
			popup_close(el.closest('.popup'));
		})
	}
}
document.addEventListener('keydown', function (e) {
	if (e.code === 'Escape') {
		popup_close();
	}
});






let viewPass = document.querySelectorAll('.form__viewpass');
for (let index = 0; index < viewPass.length; index++) {
	const element = viewPass[index];
	element.addEventListener("click", function (e) {
		if (element.classList.contains('_active')) {
			element.parentElement.querySelector('input').setAttribute("type", "password");
		} else {
			element.parentElement.querySelector('input').setAttribute("type", "text");
		}
		element.classList.toggle('_active');
	});
}






const burger = document.querySelector(".header__burger");
const menu = document.querySelector(".header__menu");
const body = document.querySelector("body");

burger.addEventListener('click', function () {
    burger.classList.toggle("menu-active");
    menu.classList.toggle("menu-active");
    body.classList.toggle("_lock");

});


window.onscroll = function () {
    let header = document.querySelector("header")
    if (window.pageYOffset > innerHeight) {
        header.classList.add("menu__bg")
    } else {
        header.classList.remove("menu__bg")
    }

}






swiper = new Swiper('.a', {

    // Стрелки
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    // Навигация
    // Буллеты, текущее положение, прогресс бар
    pagination: {
        el: '.swiper-pagination',
        // Булеты

        clickable: true,
        // Динамические булеты
        dynamicBullets: false,
        // Тип булетов 

        // type: "fraction",
        // type: "bullets",
        // type: "progressbar",
    },
    // Сколл бар
    /*
    scrollbar: {
        el: '.swiper-scrollbar',
        // возможно перетаскивание скрола
        draggble: true,
    },
    */
    // Включение
    simulateTouch: false,
    // Чувствительность спайпа
    touchRatio: 1,
    // Угол срабатывания спайпа
    touchAngle: 45,
    // Курсор перетаскивания
    grabCursor: false,
    // Переключение при клике на слайд
    slideToClickedSlide: false,
    // Отключения переключения слайдов на телефоне
    allowTouchMove: false,

    // Управление клавиатурой
    keyboard: {
        // Влючение
        enabled: false,
        // Включение
        // только когда сдайдер в пределах вьюпорта
        onlyInViewport: true,
        // Включение
        // Управление клавишами
        // pageUp, pageDown
        pageUpDown: true,
    },

    // Управление колесом мыши
    /*
    mousewheel: {
        // Чувствительность колеса мыши
        sensitiviti: 1,
        // Класс объекта на котором будет срабатывать прокрута мышью
        eventsTarget: ".swiper-container",
    },*/
    // Автовысота
    autoHeight: false,
    // Количество слайдов для показала
    slidesPerView: 1,
    // Отключение слайдера если слайдов меньше чем нужно
    watchOverflow: false,
    // Отступ между сдайдами
    spaceBetween: 0,
    // Количество пролистоваемых слайдеров
    slidesPerGroup: 1,
    // Активный слайд по центру
    centeredSlides: false,
    // Стартовый слайд
    initialSlide: 0,
    // Мультирядность
    slidesPerColumn: 1,
    // Бесконечный слайдер
    loop: true,
    // Кол-вл дублирующих слайдов
    // loopedSlides:0,
    // Свободный режим
    freeMode: true,

    // Автопрокрутка
    autoplay: {
        // Пауза между прокруткой
        delay: 4000,
        // Закончить на последнем слайде
        stopOnLastSlide: false,
        // Отключить после ручного переключения
        disableOnInteraction: false,
    },
    // Скорость
    speed: 1400,

    // Вертикальный слайдер
    // direction: "vertical",

    // Эффекты перелючения слайдов
    // Листание
    effect: "slide",
    // переворот
    effect: "flip",
    // Исчезание
    effect: "fade",
    // Дополнение к fade
    fadeEffect: {
        // Параллельная смена прозрачности
        crossFade: false,
    },
    // Допольнение к flip
    flipEffect: {
        // тень
        slideShadows: true,
        // показ только активного слайда
        limitRotation: false,
    },

    // Брейк поинты АДАПТИВ

    breakpoints: {
        320: {
            slidesPerView: 1,
        },
        480: {
            slidesPerView: 1,
        },
        992: {
            slidesPerView: 1,
        },

    },
    // миниатюры превью 
    // Cоединение двух слайдеров
    /*
    thumbs: {
        swiper: {
            el: ".b",
            slidesPerView: 3,
        }
    },
*/
});
// Второй слайдер
// const swiperr = new Swiper('.b', {
//     watchOverflow: true,
//     slidesPerView: 3,
// });

swiper = new Swiper('.moto1', {
    slidesPerView: 1,
    simulateTouch: false,
    effect: "fade",
    fadeEffect: {
        // Параллельная смена прозрачности
        crossFade: true,
    },
    thumbs: {
        swiper: {
            el: ".moto2",
            slidesPerView: 4,
        }
    },
})

swiper = new Swiper('.moto2', {
    slidesPerView: 4,
    watchOverflow: true,
})
