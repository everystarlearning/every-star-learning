const menu = document.querySelector('.menu-button');
menu?.addEventListener('click', () => {
 const opened = menu.getAttribute('aria-expanded') === 'true';
 menu.setAttribute('aria-expanded',String(!opened));
 document.querySelector('#mobile-nav').hidden = opened;
});
const cards = [...document.querySelectorAll('[data-category]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#product-search');
let selected = new URLSearchParams(location.search).get('category') || 'all';
if (!['all','packs','support','printables'].includes(selected)) selected = 'all';
function filterProducts(){
 if (!cards.length) return;
 const query=(search?.value || '').trim().toLowerCase();
 let count=0;
 cards.forEach(card => {card.hidden = (selected!=='all' && card.dataset.category!==selected) || !card.textContent.toLowerCase().includes(query); if(!card.hidden) count++;});
 filters.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter===selected)));
 const status=document.querySelector('#results');if(status) status.textContent=`${count} featured ${count===1?'resource':'resources'}`;
 const empty=document.querySelector('#no-results');if(empty) empty.hidden=count!==0;
}
filters.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;filterProducts();}));
search?.addEventListener('input',filterProducts);
if(filters.length) filterProducts();
