let openIcon = document.querySelector('.open')
let closeIcon = document.querySelector('.close')
let menuList = document.querySelector('.menu-list')
let content = document.querySelector('.content')

openIcon.addEventListener('click', () => {
	openIcon.classList.toggle('active');
	closeIcon.classList.toggle('active');
	
	menuList.classList.toggle('active');
	content.classList.toggle('active');
})

closeIcon.addEventListener('click', () => {
	closeIcon.classList.toggle('active');
	openIcon.classList.toggle('active');

	menuList.classList.toggle('active');
	content.classList.toggle('active');
})