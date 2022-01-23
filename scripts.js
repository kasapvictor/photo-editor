const UI = {
	app: document.querySelector ( '.app' ),
	reset: () => UI.app.querySelector ( '.app__filters-reset' ),
	upload: () => UI.app.querySelector ( '.app__button-upload' ),
	download: () => UI.app.querySelector ( '.app__button-download' ),
	ranges: () => UI.app.querySelectorAll ( '.app__range' ),
	presets: () => UI.app.querySelectorAll ( '.app__preset' ),
	images: () => UI.app.querySelectorAll ( '.app__image' ),
	imagePreview: () => UI.app.querySelector ( '.app__preview-img' ),
	presetActiveCls: 'app__preset--active',

}

const setupPresets = {
	1: {
		'blur': 0,
		'invert': 0,
		'sepia': 22,
		'hue-rotate': 0,
		'contrast': 12,
		'brightness': 9,
		'grayscale': 25
	},
	2: {
		'blur': 0,
		'invert': 0,
		'sepia': 25,
		'hue-rotate': 0,
		'contrast': 12,
		'brightness': 10,
		'grayscale': 25
	},
	3: {
		'blur': 0,
		'invert': 0,
		'sepia': 9,
		'hue-rotate': 0,
		'contrast': 12,
		'brightness': 9,
		'grayscale': 10
	},
	4: {
		'blur': 0,
		'invert': 0,
		'sepia': 90,
		'hue-rotate': 0,
		'contrast': 12,
		'brightness': 10,
		'grayscale': 55
	},
	5: {
		'blur': 0,
		'invert': 0,
		'sepia': 50,
		'hue-rotate': 0,
		'contrast': 10,
		'brightness': 10,
		'grayscale': 75
	}
}
const filters = {
	'blur': '0px',
	'invert': 0,
	'sepia': 0,
	'hue-rotate': '0deg',
	'contrast': 1,
	'brightness': 1,
	'grayscale': 0
}

// инициализация ползунка
function rangeInit () {
	const rangeWrap = UI.ranges ();

	if ( rangeWrap.length === 0 ) {
		return false;
	}

	rangeWrap.forEach ( wrap => {
		rangeHandler ( wrap );
	} )
}

// события ползунка
function rangeHandler ( wrap ) {
	const range = wrap.querySelector ( '.range__input' );

	if ( !range ) {
		return false;
	}

	range.addEventListener ( 'input', () => {
		const value = range.value;
		const name = range.name;

		setFilter ( name, value / 100 );
		updateOutRangeData ( value / 100, wrap );
		updateFill ( value, wrap );
		updatePreviewStyles ( name );
		removeClass ( UI.presets (), UI.presetActiveCls );
	} );
}

// обновить заполнитель
function updateFill ( value, wrap ) {
	const fill = wrap.querySelector ( '.range__fill' );
	fill.style.width = `${ value }%`;
}

// обновить значение над фильтром
function updateOutRangeData ( data, wrap ) {
	const out = wrap.querySelector ( '.range__value' );
	out.innerHTML = `${ data }`;
}

// обновить значения стилей
function updatePreviewStyles ( style ) {
	document.documentElement.style.setProperty ( `--${ style }`, `${ filters[style] }` );
}

// установка значений фильтров
function setFilter ( style, value ) {
	let v = value;
	let t = '';

	switch ( true ) {
		case  style === 'blur' :
			v = v * 10;
			t = 'px';
			break;
		case style === 'hue-rotate' :
			v = (v * 100) * 3.6;
			t = 'deg';
			break;
		case style === 'contrast' || style === 'brightness' :
			v = v * 10;
			break;
		default:
			v = value;
			t = '';
	}

	filters[style] = `${ v }${ t }`;
}

// обновление значений value у input
function updateValueOfInput ( value, wrap ) {
	const input = wrap.querySelector ( '.range__input' );
	input.value = value;
}

// сброс всех настроек
function resetFilters () {
	const ranges = UI.ranges ();

	ranges.forEach ( range => {
		const input = range.querySelector ( 'input' );
		const value = input.getAttribute ( 'value' );

		updateOutRangeData ( value / 100, range );
		updateValueOfInput ( value, range );
		removeClass ( UI.presets (), UI.presetActiveCls );
		updateFill ( value, range );
		document.documentElement.removeAttribute ( 'style' );
	} );
}

// события по клику на пресеты
function initPresets () {
	const presets = UI.presets ();
	const cls = UI.presetActiveCls;

	presets.forEach ( preset => {
		preset.addEventListener ( 'click', () => {
			if ( !preset.classList.contains ( cls ) ) {
				removeClass ( presets, cls );
				setPreset ( preset );
				preset.classList.toggle ( cls );
			} else {
				removeClass ( presets, cls );
				resetFilters ();
			}
		} );
	} );
}

// установка значений фильтров по preset
function setPreset ( preset ) {
	const index = preset.dataset.preset;
	const setup = setupPresets[index];

	if ( setup ) {

		for ( let style in setup ) {
			const value = +setup[`${ style }`] / 100;

			setFilter ( style, value );
			updatePreviewStyles ( style );

			UI.ranges ().forEach ( item => {
				if ( item.dataset.range === style ) {
					updateOutRangeData ( value, item );
					updateFill ( value * 100, item );
					updateValueOfInput ( value * 100, item );
				}
			} );
		}
	}
}

// удаляет активный класс
function removeClass ( items, cls ) {
	items.forEach ( item => item.classList.remove ( cls ) );
}

// события при клике на upload
function uploadButton () {
	const btn = UI.upload ();
	const input = btn.querySelector ( 'input' );

	input.addEventListener ( 'change', ( e ) => {
		const file = input.files[0];
		const src = URL.createObjectURL ( file );

		updateImages ( src )
	} );
}

// обновление изображений
function updateImages ( src ) {
	if ( !src ) {
		return false;
	}

	const images = UI.images ();

	images.forEach ( image => image.src = src );
}

// событие при клике на загрузку
function downloadImage () {
	const btn = UI.download ();
	const canvas = document.getElementById ( 'canvasImg' );


	btn.addEventListener ( 'click', () => {
		const image = UI.imagePreview ();

		console.log ( canvas, );
		canvas.width = image.naturalWidth;
		canvas.height = image.naturalHeight;

		const ctx = canvas.getContext ( '2d' );
		ctx.clearRect ( 0, 0, canvas.width, canvas.height );
		setFiltersToCanvas ( ctx ); // задает стили для фильтра
		drawImage ( ctx, image, canvas.width, canvas.height ); // отрисовка изображения в canvas
		downloadCanvas(canvas);
	} );
}

// установка фильтров для canvas
function setFiltersToCanvas ( ctx ) {
	let canvasFilters = "";

	for ( let i in filters ) {
		canvasFilters += `${ i }(${ filters[i] })`;
	}

	ctx.filter = canvasFilters; // применение фильтров
}

// отрисовка изображения в canvas
function drawImage ( ctx, image, w, h ) {
	ctx.drawImage ( image, 0, 0, w, h );
}

// загрузка изображения из canvas
function downloadCanvas ( canvas ) {
	const link = document.createElement ( "a" );
	link.download = "image.png";
	link.href = canvas.toDataURL ();
	link.click ();
	link.delete;
}

/* инициализация */
rangeInit ();

initPresets ();

uploadButton ();

downloadImage ();

UI.reset ().addEventListener ( 'click', resetFilters );


