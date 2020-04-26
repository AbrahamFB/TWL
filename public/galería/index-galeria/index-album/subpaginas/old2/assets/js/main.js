

var main = (function($) { var _ = {

	/**
	 * Configuraciones.
	 * @var {object}
	 */
	settings: {

		// Precargar todas las imágenes.
			preload: false,

		// Duración de la diapositiva (must match  "duration.slide" in _vars.scss).
			slideDuration: 500,

		// Duración del diseño (must match  "duration.layout" in _vars.scss).
			layoutDuration: 750,

		// Miniaturas por "fila" (must match  "misc.thumbnails-per-row" in _vars.scss).
			thumbnailsPerRow: 2,

		// Lado del envoltorio principal (must match "misc.main-side" in _vars.scss).
			mainSide: 'right'

	},

	/**
	 * Window.
	 * @var {jQuery}
	 */
	$window: null,

	/**
	 * Body.
	 * @var {jQuery}
	 */
	$body: null,

	/**
	 * Envoltura principal.
	 * @var {jQuery}
	 */
	$main: null,

	/**
	 * Miniaturas.
	 * @var {jQuery}
	 */
	$thumbnails: null,

	/**
	 * Espectador.
	 * @var {jQuery}
	 */
	$viewer: null,

	/**
	 * Palanca.
	 * @var {jQuery}
	 */
	$toggle: null,

	/**
	 * Nav (next).
	 * @var {jQuery}
	 */
	$navNext: null,

	/**
	 * Nav (previous).
	 * @var {jQuery}
	 */
	$navPrevious: null,

	/**
	 * Diapositivas.
	 * @var {array}
	 */
	slides: [],

	/**
	 * Índice de diapositivas actual.
	 * @var {integer}
	 */
	current: null,

	/**
	 * Estado de bloqueo.
	 * @var {bool}
	 */
	locked: false,

	/**
	 * Atajos de teclado.
	 * @var {object}
	 */
	keys: {

		// Escape: alternar envoltorio principal.
			27: function() {
				_.toggle();
			},

		// Up: Ascender.
			38: function() {
				_.up();
			},

		// Down: Mover hacia abajo.
			40: function() {
				_.down();
			},

		// Space: Siguiente.
			32: function() {
				_.next();
			},

		// Right Arrow: Siguiente.
			39: function() {
				_.next();
			},

		// Left Arrow: Anterior.
			37: function() {
				_.previous();
			}

	},

	/**
	 * Inicializar propiedades.
	 */
	initProperties: function() {

		// Window, body.
			_.$window = $(window);
			_.$body = $('body');

		// Miniaturas.
			_.$thumbnails = $('#thumbnails');

		// Espectador.
			_.$viewer = $(
				'<div id="viewer">' +
					'<div class="inner">' +
						'<div class="nav-next"></div>' +
						'<div class="nav-previous"></div>' +
						'<div class="toggle"></div>' +
					'</div>' +
				'</div>'
			).appendTo(_.$body);

		// Nav.
			_.$navNext = _.$viewer.find('.nav-next');
			_.$navPrevious = _.$viewer.find('.nav-previous');

		// Envoltorio principal.
			_.$main = $('#main');

		// Palanca.
			$('<div class="toggle"></div>')
				.appendTo(_.$main);

			_.$toggle = $('.toggle');

		// IE<9: Fijar el ancho del visor (sin soporte de cálculo).
			if (skel.vars.IEVersion < 9)
				_.$window
					.on('resize', function() {
						window.setTimeout(function() {
							_.$viewer.css('width', _.$window.width() - _.$main.width());
						}, 100);
					})
					.trigger('resize');

	},

	/**
	 * Inicializa los eventos.
	 */
	initEvents: function() {

		// Window.

			// Elimina is-loading-* las clases en carga.
				_.$window.on('load', function() {

					_.$body.removeClass('is-loading-0');

					window.setTimeout(function() {
						_.$body.removeClass('is-loading-1');
					}, 100);

					window.setTimeout(function() {
						_.$body.removeClass('is-loading-2');
					}, 100 + Math.max(_.settings.layoutDuration - 150, 0));

				});

			// Deshabilitar animaciones / transiciones en cambiar el tamaño.
				var resizeTimeout;

				_.$window.on('resize', function() {

					_.$body.addClass('is-loading-0');
					window.clearTimeout(resizeTimeout);

					resizeTimeout = window.setTimeout(function() {
						_.$body.removeClass('is-loading-0');
					}, 100);

				});

		// Visor.

				// Oculta el contenedor principal al tocar (<= solo medio).
				_.$viewer.on('touchend', function() {

					if (skel.breakpoint('medium').active)
						_.hide();

				});

			//Toque gestos.
				_.$viewer
					.on('touchstart', function(event) {

						// Posición de inicio de registro.
							_.$viewer.touchPosX = event.originalEvent.touches[0].pageX;
							_.$viewer.touchPosY = event.originalEvent.touches[0].pageY;

					})
					.on('touchmove', function(event) {

						// ¿No se ha registrado ninguna posición de inicio? Fianza.
							if (_.$viewer.touchPosX === null
							||	_.$viewer.touchPosY === null)
								return;

						// Calcular cosas
							var	diffX = _.$viewer.touchPosX - event.originalEvent.touches[0].pageX,
								diffY = _.$viewer.touchPosY - event.originalEvent.touches[0].pageY;
								boundary = 20,
								delta = 50;

						//Desliza hacia la izquierda (siguiente).
							if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta) )
								_.next();

						// Desliza hacia la izquierda (anterior).
							else if ( (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta)) )
								_.previous();

						// Solución de desplazamiento excesivo.
							var	th = _.$viewer.outerHeight(),
								ts = (_.$viewer.get(0).scrollHeight - _.$viewer.scrollTop());

							if ((_.$viewer.scrollTop() <= 0 && diffY < 0)
							|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

								event.preventDefault();
								event.stopPropagation();

							}

					});

		// Main.

			// Toque gestos.
				_.$main
					.on('touchstart', function(event) {

						// Fianza en xsmall.
							if (skel.breakpoint('xsmall').active)
								return;

						// Posición de inicio de registro.
							_.$main.touchPosX = event.originalEvent.touches[0].pageX;
							_.$main.touchPosY = event.originalEvent.touches[0].pageY;

					})
					.on('touchmove', function(event) {

						// Fianza en xsmall.Bail on xsmall.
							if (skel.breakpoint('xsmall').active)
								return;

						// ¿Ninguna posición de inicio registrada? Fianza.
							if (_.$main.touchPosX === null
							||	_.$main.touchPosY === null)
								return;

						// Calcular cosas
							var	diffX = _.$main.touchPosX - event.originalEvent.touches[0].pageX,
								diffY = _.$main.touchPosY - event.originalEvent.touches[0].pageY;
								boundary = 20,
								delta = 50,
								result = false;

						// Desliza para cerrar.
							switch (_.settings.mainSide) {

								case 'left':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
									break;

								case 'right':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
									break;

								default:
									break;

							}

							if (result)
								_.hide();

						// Solución de desplazamiento excesivo.
							var	th = _.$main.outerHeight(),
								ts = (_.$main.get(0).scrollHeight - _.$main.scrollTop());

							if ((_.$main.scrollTop() <= 0 && diffY < 0)
							|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

								event.preventDefault();
								event.stopPropagation();

							}

					});
		// Palanca.
			_.$toggle.on('click', function() {
				_.toggle();
			});

			// Evite que el evento brote hasta el evento "ocultar evento al tocar".
				_.$toggle.on('touchend', function(event) {
					event.stopPropagation();
				});

		// Nav.
			_.$navNext.on('click', function() {
				_.next();
			});

			_.$navPrevious.on('click', function() {
				_.previous();
			});

		// Atajos de teclado.

			// Ignora los atajos dentro de los elementos del formulario.
				_.$body.on('keydown', 'input,select,textarea', function(event) {
					event.stopPropagation();
				});

			_.$window.on('keydown', function(event) {

				// Ignorar si xsmall está activo.
					if (skel.breakpoint('xsmall').active)
						return;

				//Verificar código clave.
					if (event.keyCode in _.keys) {

						// Detener otros eventos.
							event.stopPropagation();
							event.preventDefault();

						// Atajo de llamada.
							(_.keys[event.keyCode])();

					}

			});

	},

	/**
	 *Inicializar visor.
	 */
	initViewer: function() {

		//Vincular evento de clic en miniatura.
			_.$thumbnails
				.on('click', '.thumbnail', function(event) {

					var $this = $(this);

					// Detener otros eventos.
						event.preventDefault();
						event.stopPropagation();

					// Bloqueado? Difuminar.
						if (_.locked)
							$this.blur();

					// Cambiar a la diapositiva de esta miniatura.
						_.switchTo($this.data('index'));

				});

		// Crear diapositivas a partir de miniaturas.
			_.$thumbnails.children()
				.each(function() {

					var	$this = $(this),
						$thumbnail = $this.children('.thumbnail'),
						s;

					// Objeto de diapositiva.
						s = {
							$parent: $this,
							$slide: null,
							$slideImage: null,
							$slideCaption: null,
							url: $thumbnail.attr('href'),
							loaded: false
						};

					// Padre.
						$this.attr('tabIndex', '-1');

					// Diapositiva.

						// Crear elementos.
	 						s.$slide = $('<div class="slide"><div class="caption"></div><div class="image"></div></div>');

	 					// Imagen.
 							s.$slideImage = s.$slide.children('.image');

 							// Establecer cosas de fondo.
	 							s.$slideImage
		 							.css('background-image', '')
		 							.css('background-position', ($thumbnail.data('position') || 'center'));

						// Subtítulo.
							s.$slideCaption = s.$slide.find('.caption');

							// Mueva todo * excepto * la miniatura en sí misma al título.
								$this.children().not($thumbnail)
									.appendTo(s.$slideCaption);

					// Precarga?
						if (_.settings.preload) {

							//Fuerza la imagen para descargar.
								var $img = $('<img src="' + s.url + '" />');

							// Establezca la imagen de fondo de la diapositiva.
								s.$slideImage
									.css('background-image', 'url(' + s.url + ')');

							// Marque la diapositiva como cargada.
								s.$slide.addClass('loaded');
								s.loaded = true;

						}

					// Agregar a la matriz de diapositivas.
						_.slides.push(s);

					// Establecer el índice de la miniatura.
						$thumbnail.data('index', _.slides.length - 1);

				});

	},

	/**
	 * Inicializar cosas.
	 */
	init: function() {

		// IE<10: Cero retrasos en la transición.
			if (skel.vars.IEVersion < 10) {

				_.settings.slideDuration = 0;
				_.settings.layoutDuration = 0;

			}

		// Skel.
			skel.breakpoints({
				xlarge: '(max-width: 1680px)',
				large: '(max-width: 1280px)',
				medium: '(max-width: 980px)',
				small: '(max-width: 736px)',
				xsmall: '(max-width: 480px)'
			});

		// Todo lo demas.
			_.initProperties();
			_.initViewer();
			_.initEvents();

		// Diapositiva inicial
			window.setTimeout(function() {

				// Muestra la primera diapositiva si xsmall no está activo o si simplemente está desactivado.
					skel.on('-xsmall !xsmall', function() {

						if (_.current === null)
							_.switchTo(0, true);

					});

			}, 0);

	},

	/**
	 * Cambiar a una diapositiva específica.
	 * @param {integer} index Index.
	 */
	switchTo: function(index, noHide) {

		// ¿Ya estás en index y xsmall no está activo? Fianza.
			if (_.current == index
			&&	!skel.breakpoint('xsmall').active)
				return;

		// Bloqueado? Fianza.
			if (_.locked)
				return;

		// Bloquear.
			_.locked = true;

		// Ocultar envoltorio principal si el medio está activo.
			if (!noHide
			&&	skel.breakpoint('medium').active
			&&	skel.vars.IEVersion > 8)
				_.hide();

		// Consigue diapositivas.
			var	oldSlide = (_.current !== null ? _.slides[_.current] : null),
				newSlide = _.slides[index];

		// Actualización actual.
			_.current = index;

		// Desactive la diapositiva anterior (si hay una).
			if (oldSlide) {

				// Miniatura.
					oldSlide.$parent
						.removeClass('active');

				// Diapositiva.
					oldSlide.$slide.removeClass('active');

			}

		//Activar nueva diapositiva. Activate new slide.

			// Miniatura.
				newSlide.$parent
					.addClass('active')
					.focus();

			// Diapositiva.
				var f = function() {

					// ¿Existe una vieja diapositiva? Separarlo
						if (oldSlide)
							oldSlide.$slide.detach();

					// Adjunte una nueva diapositiva.
						newSlide.$slide.appendTo(_.$viewer);

					// Adjunte una nueva diapositiva.
						if (!newSlide.loaded) {

							window.setTimeout(function() {

								// Marcar como cargando.
									newSlide.$slide.addClass('loading');

								// Espera a que se cargue.
									$('<img src="' + newSlide.url + '" />').on('load', function() {
									//window.setTimeout(function() {

										//Establecer imagen de fondo.
											newSlide.$slideImage
												.css('background-image', 'url(' + newSlide.url + ')');

										// Marcar como cargado.
											newSlide.loaded = true;
											newSlide.$slide.removeClass('loading');

										// Marcar como activo.
											newSlide.$slide.addClass('active');

										// Desbloquear.
											window.setTimeout(function() {
												_.locked = false;
											}, 100);

									//}, 1000);
									});

							}, 100);

						}

					// De otra manera ...
						else {

							window.setTimeout(function() {

								//Marcar como activo.
									newSlide.$slide.addClass('active');

								// desbloquear.
									window.setTimeout(function() {
										_.locked = false;
									}, 100);

							}, 100);

						}

				};

				// No hay diapositiva vieja? Cambiar de inmediato.
					if (!oldSlide)
						(f)();

				//De lo contrario, espere a que la diapositiva anterior desaparezca primero.
					else
						window.setTimeout(f, _.settings.slideDuration);

	},

	/**
	 * Cambia a la siguiente diapositiva.
	 */
	next: function() {

		// Calcular nuevo índice
			var i, c = _.current, l = _.slides.length;

			if (c >= l - 1)
				i = 0;
			else
				i = c + 1;

		// Cambiar.
			_.switchTo(i);

	},

	/**
	 * Cambia a la diapositiva anterior.
	 */
	previous: function() {

		// Calcular nuevo índice
			var i, c = _.current, l = _.slides.length;

			if (c <= 0)
				i = l - 1;
			else
				i = c - 1;

		// Cambiar.
			_.switchTo(i);

	},

	/**
	 * Cambia a la diapositiva "por encima" de la corriente.
	 */
	up: function() {

		// ¿Pantalla completa? Fianza.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Calcular nuevo índice
			var i, c = _.current, l = _.slides.length, tpr = _.settings.thumbnailsPerRow;

			if (c <= (tpr - 1))
				i = l - (tpr - 1 - c) - 1;
			else
				i = c - tpr;

		// Cambiar.
			_.switchTo(i);

	},

	/**
	 * Cambia a la diapositiva "debajo" de la corriente.
	 */
	down: function() {

		// ¿Pantalla completa? Fianza.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Calcular nuevo índice.
			var i, c = _.current, l = _.slides.length, tpr = _.settings.thumbnailsPerRow;

			if (c >= l - tpr)
				i = c - l + tpr;
			else
				i = c + tpr;

		// Cambiar.
			_.switchTo(i);

	},

	/**
	 * Muestra el contenedor principal.
	 */
	show: function() {

		// Ya visible? Fianza.
			if (!_.$body.hasClass('fullscreen'))
				return;

		// Mostrar envoltorio principal.
			_.$body.removeClass('fullscreen');

		// Atención.
			_.$main.focus();

	},

	/**
	 * Oculta el envoltorio principal.
	 */
	hide: function() {

		// ¿Ya escondido? Fianza.
			if (_.$body.hasClass('fullscreen'))
				return;

		// Ocultar envoltorio principal.
			_.$body.addClass('fullscreen');

		// Difuminar.
			_.$main.blur();

	},

	/**
	 *Alterna el contenedor principal.
	 */
	toggle: function() {

		if (_.$body.hasClass('fullscreen'))
			_.show();
		else
			_.hide();

	},

}; return _; })(jQuery); main.init();