'use strict';

let habbits = [];
const HABBIT_STORAGE_KEY = 'HABBIT_KEY';
let globalActiveHabbit;

// page
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.header__h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar'),
	},
	content: {
		contentDiv: document.getElementById('days'),
		nextDay: document.querySelector('.habbit__day'),
	},
	popUp: {
		popWindow: document.querySelector('.cover'),
		popIconSelect: document.querySelector('.popup__form input[name="icon"]'),
	},
};
// utils

function loadData() {
	const habbitsStrig = localStorage.getItem(HABBIT_STORAGE_KEY);
	const habbitArray = JSON.parse(habbitsStrig);
	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_STORAGE_KEY, JSON.stringify(habbits));
}

function formHandler(form, fields) {
	const formData = new FormData(form);
	const res = {};

	for (const field of fields) {
		const value = formData.get(field);
		form[field].classList.remove('error');
		if (!value) {
			form[field].classList.add('error');
		}
		res[field] = value;
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}
	if (!isValid) {
		return;
	}
	return res;
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
}

// render

function rerenderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if (!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./img/${habbit.icon}.svg" alt="${habbit.name}"/>`;
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item__active');
			}
			page.menu.appendChild(element);
			continue;
		}

		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item__active');
		} else {
			existed.classList.remove('menu__item__active');
		}
	}
}

function rerenderHead(activeHabbit) {
	page.header.h1.innerText = activeHabbit.name;
	const progress =
		activeHabbit.days.length / activeHabbit.target > 1
			? 100
			: (activeHabbit.days.length / activeHabbit.target) * 100;
	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderHabbitItem(activeHabbit) {
	page.content.contentDiv.innerHTML = '';
	for (const habbit in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');
		element.innerHTML = `<div class="habbit__day">День ${
			Number(habbit) + 1
		}</div>
			<div class="habbit__comment">
				${activeHabbit.days[habbit].comment}
			</div>
			<button class="habbit__delete-day" onclick="removeDay(${habbit})">
				<img src="/img/deleteIcon.svg" alt="удалить день ${Number(habbit) + 1}" />
			</button>
		</div>`;
		page.content.contentDiv.appendChild(element);
	}
	page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
	globalActiveHabbit = activeHabbitId;
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
	if (!activeHabbit) {
		return;
	}
	document.location.replace(document.location.pathname + '#' + activeHabbitId);
	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderHabbitItem(activeHabbit);
}

// work with days
function addDays(event) {
	event.preventDefault();
	const data = formHandler(event.target, ['comment']);
	if (!data) {
		return;
	}

	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbit) {
			return {
				...habbit,
				days: habbit.days.concat({ comment: data.comment }),
			};
		}
		return habbit;
	});
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbit);
	saveData();
}

function removeDay(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbit) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days,
			};
		}
		return habbit;
	});
	rerender(globalActiveHabbit);
	saveData();
}

// work with pop up
function togglePopUp() {
	if (page.popUp.popWindow.classList.contains('cover__hidden')) {
		page.popUp.popWindow.classList.remove('cover__hidden');
	} else {
		page.popUp.popWindow.classList.add('cover__hidden');
	}
}

// work with habbits
function setIcon(context, icon) {
	page.popUp.popIconSelect.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

function addNewHabbit(event) {
	event.preventDefault();
	const data = formHandler(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}

	const maxId = habbits.reduce(
		(acc, habbit) => (acc > habbit.id ? acc : habbit.id),
		0
	);

	habbits.push({
		id: maxId + 1,
		name: data.name,
		icon: data.icon,
		target: data.target,
		days: [],
	});
	resetForm(event.target, ['name', 'icon', 'target']);
	togglePopUp();
	saveData();
	rerender(maxId + 1);
}

(() => {
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlId = habbits.find(habbit => habbit.id == hashId);
	if (urlId) {
		rerender(urlId.id);
	} else {
		rerender(habbits[0].id);
	}
})();
