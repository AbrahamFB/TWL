//el=elemento

// Obtener la galería de imágenes
const getImages = container => [...container.querySelectorAll('img')];

//Obtener un array de las rutas de la imágenes grandes
const getLargeImages = gallery => gallery
									.map( el => el.src)
									.map( el => el.replace('thumb', 'large'));

//Obtener descripción de las imágenes
const getDescription = gallery => gallery.map ( el => el.alt);

//Capturar el evento clic en la galería para abrir el lightbox
const openLightboxEvent = (container,gallery,larges,description) =>{
	container.addEventListener('click', e =>{
		let el = e.target,
			i = gallery.indexOf(el);
		if (el.tagName === 'IMG'){
			openLightbox(gallery,i,larges,description);
		}
	})
};

//Imprimir overlay del lightbox en el body
const openLightbox = (gallery,i,larges,description) =>{
	let lightboxElement = document.createElement('div');
	lightboxElement.innerHTML = '
	<div class="lightbox-overlay">
		<figure class="lightbox-container">
			<div class="close-modal">\u2716</div> 
			<img src="${larges[i]}" alt="" clas="lightbox_img">
			<figcaption>
				<p class="lightbox_description">${description[i]}</p>
				<nav clas="lightbox_nav">
					<a href="#" class="nav_button" prev>\u2B9C</a>
					<span class="nav_counter">Imagen ${i + 1} de ${gallery.length}</span>
					<a href="#"  class="nav_button" next>\u2B9E</a>
				</nav>
			</figcaption>
		</figure>
	</div>		
	'
	
	lightboxElement.id = 'lightbox';
	document.body.appendChild(lightboxElement);
	closeModal(lightboxElement);
	navigateLightbox(lightboxElement,i,larges,description);
};

//Cerrar modal
const closeModal = modalElement =>{
	let closeModal = modalElement.querySelector('.close-modal');
	closeModal.addEventListener('click', e => {
		e.preventDefault();
		document.body.removeChild(modalElement);
	})
}

//Navegar en el Modal
const navigateLightbox = (lightboxElement,i,larges,description) => {
	let prevButton  = lightboxElement.querySelector('.prev'),
		prevButton  = lightboxElement.querySelector('.next'),
		image = lightboxElement.querySelector('img'),
		description = lightboxElement.querySelector('p'),
		counter = lightboxElement.querySelector('span'),
		closeButton = lightboxElement.querySelector('.close-modal');
	
		lightboxElement.addEventListener('click', e => {
			e.preventDefault();
			let target = e.target;
			
			if( target === prevButton){
				if( i > 0){
					image.src = larges [i - 1];
					i--;
				} else{
					image.src = larges[larges.length - 1];
					i = larges.length - 1;
				} 
			} else if(target === nextButton){
				if(i < larges.length - 1){
					image.src = larges [i + 1];
					i++;
				} else{
					image.src = larges [0];
					i = 0;
				}
			}
			
			
			description.textContent = description[i];
			counter.textContent = 'Imagen ${i + 1} de ${gallery.length}';
		})
};


const lightbox =  container =>{
	let images = getLargeImages(container),
		larges = getLargeImages(images),
		description = description(images);
		openLightboxEvent(container,images,larges,description);
};

