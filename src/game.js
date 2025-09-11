const win = window,
	doc = document,
	$$ = (id) => doc.getElementById(id),
	$h = (id, h) => { (id.length ? $$(id) : id).innerHTML = h; },
	$tog = (elt, cn, yes) => elt.classList.toggle(cn, yes),
	$block = (id, yes) => { $$(id).style.display = yes ? 'block' : 'none'; },
	createElt = (tag = 'div') => doc.createElement(tag),
	coords = 'xyz'.split(''),
	X = 0,
	Y = 1,
	Z = 2,
	T = true,
	F = false,
	U = undefined;
const listen = win.addEventListener;
const keys = {},
	mouse = {};

// Utilities
const { random, floor, ceil, round, min, max, abs, PI, cos, sin } = Math,
	TWO_PI = PI * 2,
	// loop = (n, fn) => { for (let i = 0; i < n; i++) { fn(i, n); } },
	mapLoop = (n, fn) => ('.').repeat(n).split('').map(fn),
	int = (n) => parseInt(n, 10),
	rand = (valueA = 1, valueB = 0) => (valueB + random() * (valueA - valueB)),
	randInt = (a, b) => floor(rand(a, b)),
	pickRand = (arr) => arr[randInt(arr.length)],
	clamp = (v, minV = 0, maxV = 1) => min(max(v, minV), maxV),
	lerp = (a, b, percent) => (
		(abs(b - a) < 0.1) ? b : a + (b - a) * percent // clamp(percent)
	),
	// Vector math
	dist = (vecArr1, vecArr2) => (
		(vecArr1[X] - vecArr2[X]) ** 2 + (vecArr1[Y] - vecArr2[Y]) ** 2
	) ** 0.5,
	manhattanDist = (v1, v2) => (abs(v1[X] - v2[X]) + abs(v1[Y] + v2[Y])),
	dot = (v1, v2) => v1[X] * v2[X] + v1[Y] * v2[Y] + (v1[Z] || 0 * v2[Z] || 0),
	mag = (v) => Math.sqrt(dot(v, v)),
	addVec2 = (v1, v2) => [v1[X] + v2[X], v1[Y] + v2[Y]],
	// addVec3 = (v1, v2) => [v1[X] + v2[X], v1[Y] + v2[Y], v1[Z] + v2[Z]],
	scaleVec2 = (v, s) => [v[X] * s, v[Y] * s],
	normalizeVec2 = (v) => scaleVec2(v, 1 / mag(v)),
	dirVec2 = (v1, v2) => [v2[X] - v1[X], v2[Y] - v1[Y]],
	// Radian 0 would give a direction in positive X [1, 0], and PI gives neg X
	// Radian half PI gives positive Y, so the angle is rotating counter-clockwise
	polar2Cartesian = (r, rad) => [r * cos(rad), r * sin(rad)],
	addId = (arr) => arr.map((o, id) => ({ ...o, id })),
	A = 1;

// const getBranch = (x, y, dir = 0) => {};

const line = (x, y, x2, y2, w, s, clas = '') => (
		`<line x1=${x} y1=${y} x2=${x2} y2=${y2} ${s ? `stroke=${s}` : ''} stroke-width=${w} class="${clas}" />`
	),
	makeSvg = (inside, w = 100, h = 100) => (
		`<svg width=${w} height=${h} version="1.1" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${inside}</svg>`
	),
	/*
	getBranches = (x, y, i, c) => {
		if (y <= 10 || i > 6) return null;
		const w = 10 - (i * 2);
		const splitChance = (i * 0.5);
		const h = randInt(8, 15);
		const splitNum = rand() > splitChance ? 1 : randInt(2) + 2;
		const x2 = clamp(x + randInt(-4 * i, 4 * i), 0, 100),
			y2 = clamp(y - h, 0, 100);
		const branches = mapLoop(
			splitNum,
			() => getBranches(x2, y2, i + 1, c),
		);
		return { x, y, x2, y2, w, i, branches };
	},
	getTreeLines = (tree, c) => {
		if (!tree) return '';
		const { x, y, x2, y2, w, branches } = tree;
		return line(x, y, x2, y2, w, c)
			+ branches.map((b) => getTreeLines(b, c)).join('');
	},
	*/
	getPlantSvg = (color = '#665f57', trunkColor = '#665f57') => {
		// const mid = randInt(40, 70);
		// const spread = randInt(2, 20);
		let lines = '';
		let y = 95,
			x = 50,
			b = 1;
		const rows = [];
		while (rows.length <= 5 && y > 0) {
			const splitChance = rows.length * 0.3;
			b += rand() > splitChance ? 0 : randInt(2, 4);
			x += randInt(-5, 5);
			y -= randInt(8, 15);
			const w = 9 - (rows.length * 1.5);
			const xs = mapLoop(b, () => x + randInt(-5 * b, 5 * b));
			rows.push([xs, y, w]);
		}
		rows.forEach(([xs2, y2, w], i) => {
			const [xs1 = [50], y1 = 95] = rows[i - 1] || [];
			xs2.forEach((x2) => {
				let dNearest = Infinity;
				let x1Nearest = 0;
				xs1.forEach((x1) => {
					const d = abs(x1 - x2);
					if (d < dNearest) {
						x1Nearest = x1;
						dNearest = d;
					}
				});
				// lines += line(x2, y2, x2, y2, w, pickRand([color, trunkColor]));
				const c = xs2.length > 1 ? color : trunkColor;
				lines += line(x1Nearest, y1, x2, y2 + randInt(-3, 3), w, c);
			});
		});
		// const tree = getBranches(50, 95, 0, color);
		// const lines = getTreeLines(tree, color);
		return makeSvg(`<g fill=none stroke-linecap=round>${lines}</g>`);
		/*
		return makeSvg(`
				<g stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round">
					<g stroke="${trunkColor}" stroke-width="10">
						<!-- Trunk -->
						<line x1="50" y1="95" x2="50" y2="70" stroke-width="10" />
						<line x1="50" y1="70" x2="50" y2="${mid}" stroke-width="6" />
					</g>
					<!-- Main branches -->
					<line x1="50" y1="${mid}" x2="${spread + 50}" y2="${mid - 10}" />
	 				<line x1="50" y1="${mid}" x2="${50 - spread}" y2="${mid - 10}" />
	 				<!-- Secondary branches -->
	 				<line x1="${50 + spread}" y1="${mid - 10}" x2="${50 + spread * 2}" y2="${mid - 40}" />
	 				<line x1="${50 + spread}" y1="${mid - 10}" x2="${50 + spread * 3}" y2="${mid - 30}" />
	 				<line x1="${50 - spread}" y1="${mid - 10}" x2="${50 - (spread * 2)}" y2="${mid - 40}" />
	 				<line x1="${50 - spread}" y1="${mid - 10}" x2="${50 - (spread * 3)}" y2="${mid - 30}" />
			</g>`);
		*/
	},
	getImageSrcFromSvg = (svg) => {
		const container = createElt();
		$h(container, svg);
		const svgString = new XMLSerializer().serializeToString(container.firstElementChild);
		const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
		return URL.createObjectURL(svgBlob);
	},
	getImageHtmlFromSvg = (svg) => {
		const img = new Image();
		img.src = getImageSrcFromSvg(svg);
		return img.outerHTML;
	},
	getPlantSrc = (...args) => getImageSrcFromSvg(getPlantSvg(...args)),
	getPlantHtml = (color) => getImageHtmlFromSvg(getPlantSvg(color)),
	getCatHtml = () => {
		const c = '#0b0d0a',
			eyeC = '#d4ea92';
		return makeSvg(`
			<g stroke-linecap="round">
				${line(43, 75, 43, 90, 10, c, 'foot')}
				${line(57, 75, 57, 90, 10, c, 'foot')}
				${line(75, 75, 75, 90, 10, c, 'foot')}
				${line(87, 75, 87, 90, 10, c, 'foot')}
			</g>
			<g stroke-linecap="round" stroke="#0b0d0a" fill="transparent">
				<line x1=50 y1=55 x2=80 y2=65 stroke-width="30" />
				<line x1=50 y1=40 x2=50 y2=60 stroke-width="35" />
				<line x1=45 y1=40 x2=55 y2=40 stroke-width="35" />
				  <path
    				d="M 90 60 C 90 60, 100 30, 80 10"
    				stroke-width="6"  />
			</g>
			<g stroke-linecap="round" stroke-width="4" stroke="#0b0d0a" fill="#665f57">
				<polygon points="33,28 45,25 36,12" />
				<polygon points="55,25 67,28 64,12" />
			<g>
			<g class="face">
				<g>
					${line(40, 40, 45, 40, 3, eyeC)}
					${line(55, 40, 60, 40, 3, eyeC)}
				</g>
				<g stroke="#383730" stroke-width=10 >
					<line x1=42 y1=50 x2=45 y2=50 />
					<line x1=55 y1=50 x2=58 y2=50 />
				</g>
				<polygon points="46,45 54,45 50,50" fill="#477a5a" stroke-width="0" />
			</g>
		`);
	},
	getCauldronHtml = () => {
		return `<b class=info id=cTip>craft potions [c]</b>` + makeSvg(`<g fill="#0b0d0a" stroke-linecap="round">
			<ellipse cx=28 cy=80 rx=7 ry=20 />
			<ellipse cx=72 cy=80 rx=7 ry=20 />
			<ellipse cx=50 cy=60 rx=40 ry=30 />
			<ellipse cx=60 cy=60 rx=28 ry=26 fill="#111" />
			<ellipse cx=62 cy=60 rx=24 ry=22 fill="#222" />
			<ellipse cx=50 cy=30 rx=40 ry=12 />
			<ellipse cx=50 cy=30 rx=34 ry=6 fill="transparent" stroke="#222" stroke-width="5" />
			<ellipse cx=50 cy=29 rx=30 ry=6 fill="#0b0d0a" />
			<g fill="#477a5a">
			<ellipse cx=50 cy=31 rx=28 ry=3 />
			${line(20, 10, 36, 30, 4, '#66403c')}
			<circle cx=40 cy=28 r=5.5 class="bub1" />
			<circle cx=50 cy=28 class="bub2" />
			<circle cx=36 cy=29 class="bub2" style="animation-delay: 1s"  />
			<circle cx=70 cy=28 class="bub2" style="animation-delay: 2s"  />
			</g>`);
	},
	getWitchHtml = () => {
		return makeSvg(`
				<g fill="#30191f">
					<circle cx="40" cy="44" r="20" />
					<circle cx="60" cy="44" r="20" />
				</g>
				<g stroke="#5a7b85" stroke-width="10" stroke-linecap="round">
					<line x1="43" y1="75" x2="43" y2="90" class=foot />
					<line x1="57" y1="75" x2="57" y2="90" class=foot />
				</g>

				<g stroke="#0b0d0a" stroke-width="1" fill="#0b0d0a" stroke-linecap="round">
					<polygon points="50,50  60,50 65,56 67,70 80,84  50,82  20,84 33,70 35,56 40,50" />
					
					<line x1="45" y1="40" x2="55" y2="40" stroke-width="35" stroke="#81ba78" />
					<polygon points="10,30 90,30 80,23 70,23 54,10 60,0 46,10 30,23 20,23" />
					<!-- face -->
					<circle cx="35" cy=47 r="4" fill="#61aa68" stroke-width="0" />
					<circle cx="65" cy=47 r="4" fill="#61aa68" stroke-width="0" />
					<ellipse cx="39" cy="40" rx=4 ry=6 class=eye />
					<ellipse cx="61" cy="40" rx=4 ry=6 class=eye />
					<g fill="#fff" stroke-width=0>
						<circle cx="38" cy="38" r="1" />
						<circle cx="60" cy="38" r="1" />
					</g>
					<polygon points="44,48 57,47 50,50" />
					<polygon points="46,45 54,45 50,41" fill="#477a5a" stroke-width="0" />
				</g>
				<!-- arms -->
				<g stroke="#81ba78" stroke-width="6" stroke-linecap="round" class=arms>
					<line x1="34" y1=60 x2="20" y2="65" />
					<line x1="66" y1=60 x2="80" y2="65" />
					<circle cx="20" cy="67" r="1.4" />
					<circle cx="80" cy="67" r="1.4" />
					<path
						d="M 5 50 a 10 13 0 1 1 14 14 l 5 8 l -2 2 l -7 -10 a 8 11 0 1 0 -9 -13 z" 
						fill="#b1b8a9" stroke-width=0 class=sickle />
				</g>`);
	},
	getVillagerHtml = () => {
		const hair = pickRand(['#66403c', '#665f57', '#b59766']);
		return makeSvg(`
				<g fill="${hair}">
					<circle cx="40" cy="44" r="20" />
					<circle cx="60" cy="44" r="20" />
					<circle cx="50" cy="34" r="25" />
				</g>
				<g stroke="#665f57" stroke-width="10" stroke-linecap="round">
					<line x1="43" y1="75" x2="43" y2="90" class=foot />
					<line x1="57" y1="75" x2="57" y2="90" class=foot />
				</g>
				<polygon points="50,40  60,40 75,56 70,70 80,84  50,82  20,84 30,70 25,56 40,40" fill="#8f5450" />
				<g stroke="#0b0d0a" stroke-width="1" fill="#0b0d0a" stroke-linecap="round">
					
					<line x1="45" y1="40" x2="55" y2="40" stroke-width="35" stroke="#b1b8a9" />
					<!-- face -->
					<ellipse cx=35 cy=40 rx=4 ry=4 class=eye />
					<ellipse cx=65 cy=40 rx=4 ry=4 class=eye />
					<path d="M 35 32 l 7 7 m 17 0 l 7 -7" stroke-width=3 stroke="${hair}" />
					<polygon points="43,48 57,48 50,46" />
					<polygon points="46,43 54,43 50,39" fill="#82857b" stroke-width="0" />
				</g>
				<g stroke="#b1b8a9" stroke-width="9" stroke-linecap="round">
					<line x1="28" y1="60" x2="20" y2="65" />
					<line x1="72" y1="60" x2="80" y2="65" />
				</g>`);
	},
	getVillagerManHtml = () => {
		const clothes = pickRand(['#8f5450', '#665f57']);
		const hat = pickRand(['#8f5450', '#5a7b85']);
		return makeSvg(`
				<g fill="#82857b">
					<circle cx="40" cy=34 r=16 />
					<circle cx="60" cy=34 r=16 />
				</g>
				<g stroke="#0b0d0a" stroke-width="10" stroke-linecap="round">
					<line x1="43" y1="75" x2="43" y2="90" class=foot />
					<line x1="57" y1="75" x2="57" y2="90" class=foot />
				</g>

				<g fill="${clothes}" stroke-linecap="round">
					<polygon points="50,30  60,40 75,46 67,70 60,84  50,82  40,84 33,70 25,46 40,40" />
					<path d="M 35 70 h 30" stroke="#0b0d0a" stroke-width="3" />
				</g>
				<g stroke="#0b0d0a" stroke-width="3" fill="#0b0d0a" stroke-linecap="round">
					<path d="M 50 10 l -20 10 v 20 l 10 10 h 20 l 10 -10 v-20" fill="#b1b8a9" stroke-width="0" />
					<!-- face -->
					<g stroke-width=1>
						<ellipse cx=37 cy=30 rx=4 ry=4 class=eye />
						<ellipse cx=63 cy=30 rx=4 ry=4 class=eye />
					</g>
					<path d="M 37 22 l 7 7 m 13 0 l 7 -7" stroke="#383730" />
					<polygon points="50,42 55,40 57,43 50,41 43,43 45,40" />
					<polygon points="46,35 54,35 50,31" fill="${clothes}" stroke-width="0" />
				</g>
				<path fill="${hat}" d="M 50 0 l -10 5 l -5 7 h -10 l 2 5 h 45 l 2 -5 h -10 l -5 -7" />
				<!-- arms -->
				<g stroke="#b1b8a9" stroke-width="7" stroke-linecap="round">
					<line x1="28" y1="50" x2="20" y2="55" />
					<line x1="72" y1="50" x2="80" y2="55" />
					<circle cx="18" cy="53" r="1.4" />
					<circle cx="82" cy="53" r="1.4" />
				</g>
				${line(84, 20, 80, 90, 4, '#5f3430')}
				`);
	};

// https://lospec.com/palette-list/graveyard-mist
const COLORS = [
		[11, 13, 10], // #0b0d0a
		[56, 55, 48], // #383730
		[102, 95, 87], // #665f57
		[130, 133, 123], // #82857b
		[],
		[],
		[],
		[],
		[], // dark blue
		[71, 122, 90], // (9) dark green #477a5a
		[], // light green
		[],
		[],
		[],
		[],
		[64, 41, 47], // (15) #40292f (last color)
	],
	// Performance levels
	// MAX_ENTS = 1e3, // 1000
	GROUND_SIZE = 1e4, // square size
	WANDER_SIZE = GROUND_SIZE / 9,
	G_SIZE_HALF = GROUND_SIZE / 2,
	PUSH_DIST = GROUND_SIZE / 160,
	CONTAGIOUS_DIST = GROUND_SIZE / 160,
	RENDER_DISTANCE = 1400,
	NUM_OF_PLANTS = 500,
	NUM_OF_VILLAGERS = 100,
	NUM_OF_GRASS = 400,
	NUM_OF_TREES = 150,
	MAX_ENTS = NUM_OF_PLANTS + NUM_OF_VILLAGERS + NUM_OF_GRASS + NUM_OF_TREES,
	CAM_ROUNDER = 1, // Higher = less precise camera movement, but better performance
	IMAGE_SCALE = 0.03, // Lower = better performance
	CAM_LERP = 1, // 1 = best performance, lower (towards 0) is worse

	// World stuff
	BIOME_TYPES = addId([
		{ color: COLORS[0], plants: [0], veg: 0, sink: 0.5, weight: 0.7 }, // Muck
		{ color: COLORS[1], plants: [0, 1], veg: 1, weight: 1.2 }, // Basic dark forest
		{ color: COLORS[2], plants: [0, 1, 2, 3], veg: 0.1, civ: 1 }, // tan / barren
		{ color: COLORS[9], plants: [0, 3], veg: 1 }, // green
		{ color: COLORS[15], plants: [1, 2], veg: 1 }, // (4) reddish
		{ color: COLORS[3], plants: [0, 1, 2, 3], veg: 0.1 }, // gray
	]),
	biomePoints = [
		// These are generated and will contain:
		// pos array
		// weight number
		// and all properties from the biome type
	],
	getRandPos = () => [
		randInt(-G_SIZE_HALF, G_SIZE_HALF),
		randInt(-G_SIZE_HALF, G_SIZE_HALF),
	],
	getRandNear = (pos, r = 10) => [
		pos[X] + randInt(-r, r),
		pos[Y] + randInt(-r, r),
	],
	findNearestBiomePoint = (pos = [0, 0], md = F, matchFn = F) => {
		let nearestBiomePoint;
		let nearestDist = Infinity;
		biomePoints.forEach((point) => {
			const d = (md ? manhattanDist(pos, point.pos) : dist(pos, point.pos))
				/ (point.weight || 1);
			if (d < nearestDist && (matchFn ? matchFn(point) : T)) {
				nearestDist = d;
				nearestBiomePoint = point;
			}
		});
		return nearestBiomePoint;
	},
	getRandNearCivBiome = (nearPos, r = 10) => {
		const pt = findNearestBiomePoint(nearPos, F, (point) => point.civ);
		if (!pt.pos) return nearPos;
		return getRandNear(pt.pos, r);
	},
	makeGroundImage = (scale = 0.5) => {
		const canvas = createElt('canvas'),
			ctx = canvas.getContext('2d'),
			imgSize = GROUND_SIZE * scale;
		ctx.imageSmoothingEnabled = F;
		canvas.width = imgSize;
		canvas.height = imgSize;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		// Loop through each pixel
		for (let i = 0; i < imageData.data.length; i += 4) {
			const pointIndex = i / 4;
			const x = pointIndex % canvas.width;
			const y = floor(pointIndex / canvas.height);
			const nearestBiomePoint = findNearestBiomePoint([
				// Convert to world x, y
				(x / scale) - G_SIZE_HALF,
				(y / scale) - G_SIZE_HALF,
			], F); // (random() < 0.1));
			imageData.data.set(nearestBiomePoint.color, i);
			imageData.data[i + 3] = randInt(100, 200); // random opacity for noise coloring
		}
		ctx.putImageData(imageData, 0, 0);
		$$('ground').style.backgroundImage = `url(${canvas.toDataURL()})`;
	},
	makeGround = () => {
		const g = $$('ground');
		['g-w', 'g-h'].forEach((n) => setCssVar(g, n, `${GROUND_SIZE}px`));
		// Home turf
		biomePoints.push({ pos: [0, 0], ...BIOME_TYPES[1], weight: 1.5 });
		let i;
		for (i = 0; i < 20; i++) {
			biomePoints.push({
				...BIOME_TYPES[3],
				pos: polar2Cartesian(G_SIZE_HALF, rand(TWO_PI)),
			});
		}
		for (i = 0; i < 20; i++) {
			biomePoints.push({
				...BIOME_TYPES[2],
				pos: polar2Cartesian(GROUND_SIZE / 4, rand(TWO_PI)),
				weight: 0.7,
			});
		}
		for (i = 0; i < 20; i++) {
			biomePoints.push({
				...pickRand(BIOME_TYPES),
				pos: getRandPos(),
			});
			// console.log(biomePoints[biomePoints.length - 1].pos);
		}
		makeGroundImage(IMAGE_SCALE);
		// makeGroundImage(IMAGE_SCALE / 4);
		// setTimeout(() => makeGroundImage(IMAGE_SCALE), 1000);
	};

// Game
let rc = 0,
	lastRenderTime = 0,
	renderDeltaT = 0,
	lastSimTime = 0,
	renderRamp = 0,
	camElt,
	sceneElt,
	craftOpen = F,
	invOpen = T,
	intro = 1;

const POS_SCALE = 10,
	EDGE = G_SIZE_HALF * POS_SCALE, // Ground size half pos scale
	CLOSE_RANGE = 61, // TODO: Make this related to the size of "things"
	PLAGUE_TIME = 1e4, // 10 seconds in ms
	BASE_PENT = [
		0, 0, 0, // (0,1,2) pos
		0, 0, 0, // (3,4,5) vel
		0, 0, 0, // (6,7,8) acc
		2, // (9) mass -- Set to zero if the entity doesn't exist
		10, // (10) radius
		0, // (11) rotation
		RENDER_DISTANCE + 1, // (12) distance to main character
		0, // (13) speed
	],
	PENT_SIZE = BASE_PENT.length,
	PLANT_CLASS = [
		// (0) Green
		['G', ['#477a5a', '#81ba78'], [
			'Toe of Frog',
			'Sage',
			'Thyme',
		]],
		// (1) Yellow
		['Y', ['#b59766', '#dee6b8'], [
			'Catnip',
			'Cattail',
			'Eye of Newt',
		]],
		// (2) Red
		['R', ['#8f5450', '#40292f'], [
			'Toadstool',
			'Nightshade',
			'Hemlock',
		]],
		// (3) Blue
		['B', ['#5a7b85', '#95bdb2'], [
			'Mugwort',
			'Houndstongue',
			'Rosemary',
			'Bat Wings',
		]],
		// (4) Wood
		['W', ['#0b0d0a', '#383730', '#665f57', '#66403c'], ['Wood']],
	],
	plantTypes = [],
	plantClassTypes = PLANT_CLASS.map(() => []),
	POTIONS = [
		// (0) Name
		// (1) Requirements: Classes needed for recipe
		// (2) Emoji
		// (3) Duration (seconds)
		['Cat', [1, 1], '🐈‍⬛', 60],
		['Reaper', [0, 0], '🪓', 50],
		['Regrow', [0, 1], '🌱', 5],
		['Wind Walker', [1, 2], '💨', 40], //  🌬️
		['Double Harvest', [0, 0, 0], '🍃', 30],
		['Alter Roots', [0, 2], '🌿', 20],
		['Feline Plague', [0, 1, 2, 3], '☣️', 60],
		['Detox', [0, 3], '🌊', 2],
		['Feather', [3, 3], '☁️', 30],
	],
	EFFECTS = [
		['Cat'], // 0
		['x3 Sickle Dmg.'], // 1
		['Regrow Aura'], // 2
		['Fast'], // 3
		['Double Harvest'], // 4
		['Alteration Aura'], // 5
		['Cat-Contagious'], // 6
		['Cleanse'], // 7
		['Float'], // 8
	],
	POTION_MAT_REQ = 10,
	CIRCLE_RADIUS = 160,
	potionsKnown = [1],
	eltStyleMirrors = {},
	pEnts = new Int32Array(MAX_ENTS * PENT_SIZE), // Physics entities
	ents = [],
	camPos = [0, 0, 0],
	camTarget = [0, 0, 250],
	news = ['Collect materials from plants [e]..', 'Craft potions at the cauldron...', 'Get rid of all the hostile villagers to win.'],
	addNews = (t) => {
		news.push(t);
		news.splice(0, max(news.length - 5, 0));
		renderNews();
	},
	loopOverPotionReq = (mats, potionId, useMatFn) => {
		const matsLeft = { ...mats }; // Copy
		return POTIONS[potionId][1].map((pClassId) => { // Loop over potion requirements
			const matKeys = Object.keys(matsLeft);
			const usableMatKeys = matKeys.filter((k) => (
				plantTypes[k].classId === pClassId
				&& matsLeft[k] >= POTION_MAT_REQ
			));
			const k = usableMatKeys[0];
			const have = (usableMatKeys.length && k);
			if (have) {
				if (useMatFn) useMatFn(k);
				delete matsLeft[k];
			}
			return have;
		});
	},
	getPotionReqFilled = (ei, potionId) => {
		const mats = { ...ents[ei].mats }; // Copy
		return loopOverPotionReq(mats, potionId);
	},
	countFalse = (arr) => arr.reduce((sum, b) => sum + (!b ? 1 : 0), 0),
	destroy = (i) => {
		setMass(i); // Set mass to zero to not render
		ents[i].elt.remove();
	},
	scalePosToPx = (n) => n / POS_SCALE,
	scalePxToPos = (n) => n * POS_SCALE,
	setPos = (i = 0, pxPos = [0, 0]) => {
		pEnts.set(pxPos.map(scalePxToPos), i * PENT_SIZE);
	},
	setMass = (i, m = 0) => {
		// pEnts.set([m], (i * PENT_SIZE) + 9);
		pEnts[i * PENT_SIZE + 9] = m;
	},
	getMass = (i) => pEnts[i * PENT_SIZE + 9],
	getVec2Pos = (i) => pEnts.subarray(i * PENT_SIZE, (i * PENT_SIZE) + 2),
	scaleVectorToPxPos = (v) => v.map(scalePosToPx),
	getPxPos = (i) => getVec2Pos(i).map(scalePosToPx),
	// addPos = (i = 0, coordIndex, n) => { pEnts[(i * PENT_SIZE) + coordIndex] += n; },
	setAcc = (i = 0, vec) => {
		pEnts.set(vec.map(scalePxToPos), (i * PENT_SIZE) + 6);
	},
	hasFx = (i, fxId) => {
		return (ents[i].fx?.[fxId] || 0) > 0;
	},
	onGround = (i) => {
		return pEnts[(i * PENT_SIZE) + Z] <= 0;
	},
	jump = (i, m = 1) => {
		const j = i * PENT_SIZE;
		if (!onGround(i)) return;
		pEnts[j + Z] += 1;
		pEnts[j + 5] += 280 * (hasFx(i, 3) ? 1.5 : 1) * m;
		// addNews('jump' + randInt(1000));
	},
	addItem = (type, id, name) => {
		const { items } = ents[0];
		const ii = items.findIndex((it) => it && it[0] === type && it[1] === id);
		if (ii === -1) items.push([type, id, '#fff', name, 1]);
		else items[ii][4] += 1;
	},
	harvest = (ei, ti) => {
		// ei = entity index doing the harvesting
		// ti = target entity getting harvested
		const e = ents[ei];
		if (e.cooldown > 0) return;
		const target = ents[ti];
		if (target.hp <= 0 || target.typeId === U) return;
		// We can harvest, so proceed...
		e.cooldown = 800;
		const hit = randInt(50) * (hasFx(ei, 1) ? 3 : 1);
		target.hp -= hit;
		let harvestAmount = max(1, round(hit / 10));
		// target.rot += randInt(45) - randInt(45); // This isn't working :(
		jump(ti);
		jump(0, 0.6);
		if (target.hp <= 0) {
			destroy(ti);
			harvestAmount += 2;
		}
		harvestAmount *= (hasFx(ei, 4) ? 2 : 1);
		// console.log('Harvest', target);
		e.mats[target.typeId] = (e.mats[target.typeId] || 0) + harvestAmount;
		// renderEntity(ti);
		renderPlayerUI();
		addNews('Harvested ' + harvestAmount + ' ' + plantTypes[target.typeId].name);
	},
	craft = (pId) => {
		const potionId = int(pId);
		const fills = getPotionReqFilled(0, potionId);
		if (countFalse(fills)) return;
		const { mats } = ents[0];
		loopOverPotionReq(mats, potionId, (k) => { mats[k] -= POTION_MAT_REQ; });
		const pot = POTIONS[potionId];
		potionsKnown[potionId] = 1;
		addItem(0, potionId, pot[0] + ' potion');
		renderPlayerUI();
	},
	applyPotion = (ent, p) => {
		ent.fx[p] = (ent.fx[p] || 0) + POTIONS[p][3] * 1000;
		if (p === 0) { // cat
			setCat(0, T);
		} else if (p === 7) {
			Object.keys(ent.fx).forEach((key) => {
				const k = int(key);
				if (k !== 7) ent.fx[k] = 0;
			});
		}
	},
	useItem = (itemId) => {
		const { items } = ents[0];
		const item = items[itemId];
		if (!item) return;
		// console.log('Use item', item);
		const [type, id, color, name, quant] = item;
		item[4] -= 1;
		if (item[4] <= 0) items[itemId] = null;
		if (type === 0) { // potion
			applyPotion(ents[0], id);
			addNews(`You drink the ${name}`);
		}
		renderPlayerUI();
	},
	accEnt = (i, dir = [0, 0], scale = 0) => {
		const j = i * PENT_SIZE;
		const a = pEnts.subarray(j + 6, j + 9);
		const accVec = addVec2(a, scaleVec2(normalizeVec2(dir), scale));
		accVec.push(a[Z]);
		pEnts.set(accVec, j + 6);
	},
	movement = (i, dir = [0, 0], running = 0) => {
		let accScale = running ? ents[i].sprintSpeed : ents[i].walkSpeed;
		if (hasFx(i, 3)) accScale = 5;
		accEnt(i, dir, accScale);
	},
	makeEnt = (i, obj = {}) => {
		pEnts.set(BASE_PENT, i * PENT_SIZE);
		// pEnts[(i * PENT_SIZE) + 9] = 9; // set mass to a positive number
		const { classes = [], html, src, alt } = obj;
		const elt = createElt(src ? 'img' : 'div');
		elt.id = `e${i}`;
		if (src) elt.src = src;
		if (alt) elt.title = alt;
		elt.className = [...classes, 'thing'].join(' ');
		if (html) $h(elt, html);
		$$('scene').appendChild(elt);
		const o = { ...obj, i, elt, cooldown: 0, hp: 100, maxHp: 100, rot: 0 };
		ents.push(o);
	},
	setFeet = (i) => {
		ents[i].feet = [...ents[i].elt.querySelectorAll('.foot')];
	},
	switchEntHtml = (i, html) => {
		ents[i].lastHtml = ents[i].html;
		$h(ents[i].elt, html);
		setFeet(i);
	},
	resetEntHtml = (i) => {
		switchEntHtml(i, ents[i].lastHtml);
	},
	setCat = (i, yes) => {
		ents[i].isCat = yes;
		if (yes) switchEntHtml(i, getCatHtml());
		else resetEntHtml(i);
	},
	setIll = (i, n = 1) => {
		ents[i].ill = n;
		$tog(ents[i].elt, 'ill', ents[i].ill);
	},
	setCssVar = (elt, name, val, optionalId) => { // , key) => {
		setStyle(elt, `--${name}`, val, optionalId);
	},
	setStyle = (elt, propName, val, optionalId) => {
		const uid = optionalId || elt.id;
		if (!uid) throw new Error('no uid');
		if (!eltStyleMirrors[uid]) eltStyleMirrors[uid] = {};
		if (eltStyleMirrors[uid][propName] === val) return;
		elt.style.setProperty(propName, val);
		eltStyleMirrors[uid][propName] = val;
	},
	findZeroMasses = (checkFn) => {
		const arr = [];
		for (let i = ents.length - 1; i >= 0; i--) {
			if (getMass(i) === 0 && (!checkFn || checkFn(i))) arr.push(i);
		}
		return arr;
	},
	getRandPlantType = (pos) => {
		const biome = findNearestBiomePoint(pos),
			classId = pickRand(biome.plants),
			type = pickRand(plantClassTypes[classId]);
		return type;
	},
	setPlantType = (i, type) => {
		if (!ents[i].isPlant) return;
		ents[i].src = type.src;
		ents[i].typeId = type.index;
		ents[i].elt.src = type.src;
	},
	regrow = (pos) => {
		if (rand() > 0.03) return;
		// Find an empty/dead plant
		const arr = findZeroMasses((i) => ents[i].isPlant);
		// console.log(arr.length);
		if (!arr.length) return;
		const i = arr[0];
		// Move to random position around position
		setPos(i, getRandNear(pos, 200));
		setMass(i, 2);
		ents[i].hp = ents[i].maxHp;
		// Change type of plant to match biome
		const type = getRandPlantType(pos);
		setPlantType(i, type);
	},
	reroot = (pos) => {
		if (rand() > 0.1) return;
		const nearPlants = ents.filter((ent, u) => {
			if (!ent.isPlant || !getMass(u)) return F;
			return dist(getPxPos(u), pos) < 200;
		});
		if (!nearPlants.length) return;
		const ent = pickRand(nearPlants);
		ent.hp = ent.maxHp;
		setPlantType(ent.i, pickRand(plantTypes));
	},
	physics = (i, deltaT) => {
		const j = i * PENT_SIZE;
		const entArray = pEnts.subarray(j, j + PENT_SIZE);
		const t = deltaT / 15;
		// Update position based on velocity
		entArray[0] += entArray[3] * t;
		entArray[1] += entArray[4] * t;
		entArray[2] = clamp(entArray[2] + entArray[5] * t, 0, 5000);
		// Update velocity
		entArray[3] = clamp((entArray[3] + entArray[6] * t) * 0.9, -200, 200);
		entArray[4] = clamp((entArray[4] + entArray[7] * t) * 0.9, -200, 200);
		entArray[5] = clamp((entArray[5] + entArray[8] * t) * 0.9, -200, 200);
		// Update acceleration
		if (entArray[0] > EDGE || entArray[0] < -EDGE
			|| entArray[1] > EDGE || entArray[1] < -EDGE
		) {
			entArray[6] = -entArray[0];
			entArray[7] = -entArray[1];
		} else {
			entArray[6] = 0;
			entArray[7] = 0;
		}
		entArray[8] = (entArray[2] >= 0) ? -10 : 0; // gravity
		if (hasFx(i, 8)) entArray[8] *= 0.1;

		entArray[13] = mag(entArray.subarray(3, 6));

		// if (i === 0) console.log(entArray.join(', '));

		pEnts.set(entArray, j);
		// 0, 0, 0, // (0,1,2) pos
		// 0, 0, 0, // (3,4,5) vel
		// 0, 0, 0, // (6,7,8) acc
		// 2, // (9) mass -- Set to zero if the entity doesn't exist
		// 10, // (10) radius
		// 0, // (11) rotation
	},
	simLoop = () => {
		const t = performance.now();
		const deltaT = lastSimTime ? t - lastSimTime : 0;
		lastSimTime = t;
		// const mv = 3;
		// if (keys.a || keys.ArrowLeft) addPos(0, X, -mv);
		// if (keys.d || keys.ArrowRight) addPos(0, X, mv);
		// if (keys.w || keys.ArrowUp) addPos(0, Y, -mv);
		// if (keys.s || keys.ArrowDown) addPos(0, Y, mv);

		let dir = [0, 0];
		if (keys.a || keys.arrowleft) dir[X] -= 1;
		if (keys.d || keys.arrowright) dir[X] += 1;
		if (keys.w || keys.arrowup) dir[Y] -= 1;
		if (keys.s || keys.arrowdown) dir[Y] += 1;
		movement(0, dir, keys.shift);
		if (keys[' ']) jump(0);
		if (keys.c) { toggleCraft(); keys.c = F; }
		if (keys.tab) { toggleInv(); keys.tab = F; }
		// if (keys['1']) useItem(0);
		if (keys.enter) {
			intro = (intro + 1) % 4;
			$tog($$('body'), 'splash', intro);
			$tog($$('dialog'), 'on', intro > 1);
			$block('splash', intro === 1);
			$block('d1', intro === 2);
			$block('d2', intro === 3);
			const nextText = '[Enter] to ' + (intro === 2 ? 'Advance Dialog' : 'Start');
			$h('next', nextText);
			keys.enter = F;
		}

		const pc = ents[0],
			pcOnGround = onGround(0),
			pcHasPlague = hasFx(0, 6),
			pcPos = getPxPos(0);
		let pos,
			close,
			rot,
			ent,
			nearest = Infinity,
			nearestIndex;
		for (let i = ents.length - 1; i >= 0; i--) {
			ent = ents[i];
			if (ent.cooldown > 0) ent.cooldown = max(ent.cooldown - deltaT, 0);
			pos = getPxPos(i);
			close = dist(pos, pcPos);
			if (close < nearest && i > 0) {
				nearest = close;
				nearestIndex = i;
			}
			pEnts[(i * PENT_SIZE) + 12] = close;
			rot = 0;
			if (i > 0) {
				// if (randInt(100) === 2) {
				// addPos(i, pickRand([X, Y]), pickRand([-5, -2, -1, 1, 2, 5]));
				// }
				if (close < CLOSE_RANGE) {
					// ent.rot = lerp(
					// 	ent.rot,
					// 	round((1 - (close / CLOSE_RANGE)) * (pos[X] < pcPos[X] ? -80 : 80)),
					// 	0.1,
					// );
					// ent.rot = 90;
					const { maxRot = 80 } = ent;
					ent.rot = round(
						(1 - (close / CLOSE_RANGE)) * (pos[X] < pcPos[X] ? -maxRot : maxRot),
					);
					// ent.rot = rot;
					// setCssVar(ent.elt, 'rot-z', `${rot}deg`, `${i}-rot-z`);
				} else if (randInt(2000) === 2) {
					rot = randInt(8) - randInt(8);
					// setCssVar(ent.elt, 'rot-z', `${rot}deg`, `${i}-rot-z`);
					// ents[i].elt.style.setProperty('--rot-z', `${rot}deg`);
				}
			}

			physics(i, deltaT);

			if (ent.fx) {
				const { fx } = ent;
				if (hasFx(i, 2)) { // Regrow
					regrow(pos);
				}
				if (hasFx(i, 5)) { // Root alteration
					reroot(pos);
				}
				Object.keys(ent.fx).forEach((key) => {
					const fxId = int(key); // key is string, so needs to be converted
					if (fx[fxId] <= 0) return;
					fx[fxId] = max(fx[fxId] - deltaT, 0);
					if (fx[fxId] <= 0) { // potion just expired
						if (fxId === 0 || fxId === 7) { // Cat FX or Cleanse
							setCat(i, F);
						}
					}
				});
			}

			if (ent.target) {
				if (dist(pos, ent.target) > 5) movement(i, dirVec2(pos, ent.target));
				else ent.target = F;
			}

			if (ent.push && close < ent.push && pcOnGround && !pc.isCat && !ent.isCat) {
				dir = (rand() < 0.3) ? dirVec2(pos, pcPos) : dirVec2(pcPos, [0, 0]);
				accEnt(0, dir, 2);
			}

			if (pcHasPlague && close < CONTAGIOUS_DIST && ent.ill === 0 && !ent.isCat) {
				setIll(i); // The illness begins
			} else if (ent.ill > PLAGUE_TIME) {
				setCat(i, T);
				setIll(i, 0);
				let vCount = 0;
				const catCount = ents.reduce((sum, e) => {
					if (e.isVillager) vCount++;
					return sum + (e.isCat ? 1 : 0);
				}, 0);
				addNews(`${catCount} / ${vCount} villagers turned into cats!`);
				if (catCount >= vCount) addNews('🐈‍⬛😻 You win! 😸🐈‍⬛');
			} else if (ent.ill > 0) {
				ent.ill += deltaT;
			}

			if (typeof ent.planCooldown === 'number') {
				if (ent.planCooldown <= 0) {
					ent.planCooldown = 1e3 + randInt(4e3); // 1 - 5 seconds
					if (ent.isCat) {
						if (rand() < 0.5) {
							ent.target = (rand() < 0.1)
								? getRandNear(pcPos, 50)
								: getRandNear(pos, WANDER_SIZE);
						} // else do nothing
					} else
						// Non-Cat
						if (ent.sight && close < ent.sight && !ents[0].inCircle && !pc.isCat) {
							ent.target = getRandNear(pcPos, 50);
							ent.planCooldown = 800; // shorter pause
						} else if (rand() < 0.5) {
							ent.target = (rand() < 0.5)
								? getRandNear(pos, WANDER_SIZE)
								: getRandNearCivBiome(pos, WANDER_SIZE / 2);
						} // else do nothing
				} else ent.planCooldown -= deltaT;
			}

			// Special events
			if (ent.inCircle !== U) {
				const isIn = dist(pos, [0, 0]) < CIRCLE_RADIUS;
				const changed = (
					(isIn && !ent.inCircle)
					|| (!isIn && ent.inCircle)
				);
				ent.inCircle = isIn;
				if (!isIn) craftOpen = F;
				if (i === 0 && changed) renderPlayerUI();
			}
		}
		// Events just for the player character
		if ((keys.e || mouse.down) && nearest < CLOSE_RANGE) {
			harvest(0, nearestIndex);
			$tog(pc.elt, 'harvesting', T);
		} else if (dir[0] !== 0 || dir[1] !== 0) {
			$tog(pc.elt, 'harvesting', F);
		}
		// Continue
		setTimeout(simLoop, 16);
	},

	// ---------- RENDERING -------------------------------------------------
	arrToHtml = (id, arr, fn) => {
		// console.log(id);
		$h(id, arr.map(fn).join(''));
	},
	renderNews = () => arrToHtml('news', news, (t) => `<b>${t}</b>`),
	renderInventory = () => {
		$tog($$('inv'), 'open', invOpen);
		arrToHtml('items', ents[0].items, (item, i) => {
			if (!item) return '';
			const [type, index, color, label, quant] = item || [];
			const potion = POTIONS[index];
			// return `<b class=item data-itemid="${i}">${label} x${quant}
			// ${potion[2]}<b class=itemNum>${i + 1}</b></b>`;
			return `<b class=item data-itemid="${i}">${label} x${quant} ${potion[2]}</b>`;
		});
		arrToHtml('mats', Object.entries(ents[0].mats), ([pId, quant]) => {
			const pt = plantTypes[pId];
			return `<b style="color: ${pt.color}">${quant} ${pt.name}</b>`;
		});
	},
	renderCraft = () => {
		$tog($$('cTip'), 'open', ents[0].inCircle && !craftOpen);
		$tog($$('craft'), 'open', ents[0].inCircle && craftOpen);
		// $h('cTitle', 'Craft' + (ents[0].inCircle ? 'ing' : ' at the Pentacle'));
		arrToHtml('cList', POTIONS, ([name, req], i) => {
			const fills = getPotionReqFilled(0, i);
			const unfilledCount = countFalse(fills);
			return (`<b data-potionid="${i}" class="recipe ${unfilledCount ? 'un' : ''}filled">
				${req.map(
					(pClassId, ri) => {
						const [cName, colors] = PLANT_CLASS[pClassId];
						return `<span class="req req${fills[ri] ? 'F' : 'Unf'}illed" style="background-color: ${colors[0]}">${POTION_MAT_REQ} ${cName}</span>`;
					},
				).join(' + ')}
				&rarr; <i class=rName>${potionsKnown[i] ? name : '????'}</i></b>`);
		});
	},
	toggleCraft = () => {
		craftOpen = !craftOpen;
		renderCraft();
	},
	toggleInv = () => {
		invOpen = !invOpen;
		renderInventory();
	},
	renderEffects = () => {
		arrToHtml('fx', Object.entries(ents[0].fx), ([key, duration]) => {
			if (duration <= 0) return '';
			const [name] = EFFECTS[key];
			return `<b>
				${name}
				<b>${ceil(duration / 1e3)} sec</b>
				<b class=bar><b style="height: ${clamp(ceil(duration / 600), 0, 100)}%"></b></b>
				</b>`;
		});
	},
	renderPlayerUI = () => {
		renderInventory();
		renderCraft();
		renderEffects();
	},
	renderEntity = (i, t) => {
		const j = i * PENT_SIZE;
		if (!getMass(i)) return; // Don't render if no mass
		const { elt, rot, feet, fx } = ents[i];
		setStyle(elt, 'display', (pEnts[j + 12] > RENDER_DISTANCE) ? 'none' : 'block');
		// if (pEnts[(i * PENT_SIZE) + 12] > RENDER_DISTANCE) { // Render distance
		// if (style.display !== 'none') style.display = 'none';
		// style.display = 'none';
		// } else if (style.display !== 'block') style.display = 'block';
		// } else style.display = 'block';
		for (rc = 0; rc < 3; rc++) {
			setCssVar(
				elt,
				coords[rc],
				`${scalePosToPx(pEnts[j + rc])}px`,
				`${i}-${coords[rc]}`,
			);
		}
		setCssVar(elt, 'rot-z', `${rot}deg`, `${i}-rot-z`);

		if (feet) {
			const speed = pEnts[j + 13]; // Generally seems to go from 0 - 45
			// Step speed seems good at frequency 0.01 - 0.04
			// Oscillating value = amplitude * sin(t * frequency)
			const osc = sin(t * (speed / 2e3));
			const steps = [osc * 2, osc * -2]; // 2 is the amplitude
			feet.forEach((ft, fi) => setCssVar(ft, 'step', steps[fi % 2], i + '-' + fi + 'step'));
		}

		if (fx) {
			renderEffects();
		}
	},
	renderLoop = (t) => {
		// Figure out the time and FPS
		renderDeltaT = (renderDeltaT + (t - lastRenderTime)) / 2;
		// if (t % 3 === 0) {
		// $$('debug').innerText = `Delta t: ${round(renderDeltaT)}, FPS: ${(round(1000 / renderDeltaT) + '').padStart(3, ' ')}`;
		// }
		lastRenderTime = t;

		// Render
		if (renderRamp < MAX_ENTS) renderRamp += 60;
		for (let i = 0; i < renderRamp; i++) {
			renderEntity(i, t);
		}
		// ents.forEach(render);

		// Update camera
		// Follow main player (zero index), but only do so every certain number of pixels
		// to avoid too many updates of the scene/cam
		const target = (c) => {
			camTarget[c] = -round(scalePosToPx(pEnts[c]) / CAM_ROUNDER) * CAM_ROUNDER;
		};
		if (intro) {
			// camTarget[X] = 0;
			// camTarget[Y] = 0;
			// camTarget[Z] = 200;
		} else {
			target(X);
			target(Y);
		}
		for (let c = 0; c < 3; c++) {
			if (camPos[c] !== camTarget[c]) {
				// The lerp here caused too many updates to the scene/cam which caused
				// a big performance issue
				camPos[c] = lerp(camPos[c], camTarget[c], CAM_LERP);
				setCssVar(
					c === Z ? camElt : sceneElt,
					(c === Z ? 'cam-' : 'scene-') + coords[c],
					`${camPos[c]}px`,
				);
			}
		}
		requestAnimationFrame(renderLoop);
	},
	start = () => {
		// Setup Elements
		camElt = $$('camera');
		sceneElt = $$('scene');
		// craftElt = $$('craft');
		// invElt = $$('inv');
		// Setup World
		// Setup Ground
		makeGround();
		// Setup Entities
		let i = 0;
		// Make player character
		makeEnt(i++, {
			classes: ['witch'],
			html: getWitchHtml(), // getCatHtml(),
			// feet: [$$('wFL'), $$('wFR')],
			items: [
				// [0, 0, '#fff', 'Cat potion', 50],
				// [0, 1, '#fff', 'Axe potion', 50],
				// [0, 2, '#fff', 'Grow potion', 50],
				// [0, 3, '#fff', 'Wind Walker potion', 50],
				// [0, 4, '#fff', 'Double potion', 50],
				// [0, 5, '#fff', 'Chaos potion', 50],
				// [0, 6, '#fff', 'Feline Plague potion', 50],
				// [0, 7, '#fff', 'Vomit potion', 50],
				// [0, 8, '#fff', 'Float potion', 50],
			],
			mats: {
				// 0: 100,
				// 1: 100,
				// 3: 100,
				// 5: 100,
			},
			fx: {},
			inCircle: 0,
			walkSpeed: 2,
			sprintSpeed: 3,
		});
		setPos(0, [CIRCLE_RADIUS / 2.5, CIRCLE_RADIUS / 2.5]);
		setFeet(0);
		// Make Cauldron (id 1)
		makeEnt(i++, {
			classes: ['cauldron'],
			html: getCauldronHtml(),
			maxRot: 10,
		});
		setPos(1, [0, 0]);

		// Make plant Data
		let ti = 0;
		PLANT_CLASS.forEach(
			(c, ci) => c[2].forEach(
				(name) => plantTypes.push({
					index: ti++,
					name,
					html: getPlantHtml(c[1][0]),
					src: getPlantSrc(c[1][0]),
					classId: ci,
					color: c[1][0],
				}),
			),
		);
		plantTypes.forEach((pt) => plantClassTypes[pt.classId].push(pt));
		// console.log('Plant Classes:', plantClassTypes, '\nPlant Types:', plantTypes);
		// console.log('Biomes:', BIOME_TYPES);

		// Make plants
		// const plantHtml = getPlantHtml();
		const removeNonVeg = (u) => {
			const pxPos = getPxPos(u),
				biome = findNearestBiomePoint(pxPos),
				d = dist(pxPos, [0, 0]);
			if (d < CIRCLE_RADIUS || !biome.veg || rand() > biome.veg) setMass(u, 0);
			return biome;
		};
		for (; i < NUM_OF_PLANTS; i++) {
			const pos = getRandPos(),
				biome = findNearestBiomePoint(pos),
				classId = pickRand(biome.plants),
				type = pickRand(plantClassTypes[classId]);
			// console.log(biome.id, scaleVectorToPxPos(pos));
			makeEnt(i, {
				alt: 'plant',
				classes: ['plant'],
				// html: type.html, // html: plantHtml
				src: type.src,
				typeId: type.index,
				isPlant: T,
			});
			setPos(i, pos);
			if (!biome.veg || rand() > biome.veg) setMass(i, 0);
			const b = removeNonVeg(i);
			// console.log(biome.id, b.id, pos, getPxPos(i));
		}
		// Make villagers
		const vHtml = [
			getVillagerHtml(),
			getVillagerHtml(),
			getVillagerHtml(),
			getVillagerManHtml(),
			getVillagerManHtml(),
			getVillagerManHtml(),
		];
		for (let v = 0; v < NUM_OF_VILLAGERS; v++) {
			makeEnt(i, {
				alt: 'villager',
				classes: ['villager'],
				html: pickRand(vHtml),
				isVillager: T,
				target: null, // position array
				planCooldown: randInt(1e4),
				sight: GROUND_SIZE / 40,
				push: PUSH_DIST,
				walkSpeed: 3,
				sprintSpeed: 3,
				ill: 0,
			});
			setPos(i, getRandPos());
			setFeet(i);
			i++;
		}
		for (let v = 0; v < NUM_OF_GRASS; v++) {
			makeEnt(i, {
				alt: 'grass',
				classes: ['grass'],
				html: '',
				isGrass: true,
			});
			setPos(i, getRandPos());
			const biome = removeNonVeg(i);
			if (rand() < 0.5) {
				ents[i].elt.style.backgroundColor = `rgb(${biome.color.join(',')})`;
			}
			i++;
		}
		const trees = ['#0b0d0a', '#383730', '#665f57', '#66403c']
			.map((c) => getPlantSrc(c, c));
		for (let v = 0; v < NUM_OF_TREES; v++) {
			makeEnt(i, {
				alt: 'tree',
				classes: ['tree'],
				src: pickRand(trees),
			});
			setPos(i, getRandPos());
			removeNonVeg(i);
			i++;
		}
		// Setup Events
		onkeydown = onkeyup = (e) => {
			keys[e.key.toLowerCase()] = e.type[3] == 'd';
			if (e.key === 'Tab') e.preventDefault();
		};
		onclick = (e) => {
			const recipe = e.target.closest('.recipe');
			const item = e.target.closest('.item');
			if (e.target.closest('#iTitle')) {
				toggleInv();
			} else if (e.target.closest('.cauldron')) {
				toggleCraft();
			} else if (recipe) {
				craft(int(recipe.dataset.potionid));
			} else if (item) {
				useItem(int(item.dataset.itemid));
			}
		};
		onmousedown = () => { mouse.down = 1; };
		onmouseup = () => { mouse.down = 0; };
		listen('wheel', (e) => { camTarget[Z] = clamp(camTarget[Z] - e.deltaY / 4, -2e3, 350); });
		// Start loops
		simLoop();
		renderLoop(0);
		renderPlayerUI();
		renderNews();
	};
listen('DOMContentLoaded', start);

win.biomePoints = biomePoints;
win.pEnts = pEnts;
win.ents = ents;
win.keys = keys;
win.mouse = mouse;
