#version 330 core


/**
	Date: 13-06-2025


	From The Art of Code, "Shader Coding: Making a starfield - Part 1 (and 2)"

    For the Part 2,

    this version had the cell grid issue.

    But it was fixed using the formula `trv = min(int(scale/2), 5);` as seen
	in the latest version.
*/

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(mix(0.0, 1.0, og_mouse_coord.x / u_resolution.x), mix(0.0, 1.0, mouse_y / u_resolution.y));
    return nm;
}


void DrawFirstStarFalseLight()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	//	First Star
	/**
		This is not the best because the falloff (transition from bright center to dark edges)
		is not what is seen in a star because for this one, it actually goes to zero past the radius.

		But for real stars, the brightness goes close to zero (black) but is never zero. Hence
		all over the screen there is contribution to the brightnness by the star
	*/
	vec3 col = vec3(0.0f);
	float d = length(uv);
	float m = smoothstep(0.2, 0.05, d);
	col += m;

	gl_FragColor = vec4(col, 1.0f);
}


void DrawFirstStarTrueLight()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	//	True Star (Looks more like a light.)

	float rad = .1;	//	modify to change size of glowing center

	vec3 col = vec3(0);
	float d = length(uv);
	//	Dividing a numerator by the distance gives this effect.
	//	Because dividing a value that is not zero by any other value
	//	results in a dividend that approaches but never becomes zero
	float m = rad / d;
	col += m; //	visualize the star center

	gl_FragColor = vec4(col, 1.0f);
}


void DrawLightWithRaysV1()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0);

	float d = length(uv);
	float m = .02 / d;
	col += m;	//	visualize the star center

	//	For the Star Rays
	//m = uv.x;
	//col += m; //	To visualize uv (0 in middle, -0.5 left *black, 0.5 right *white)

	//	To visualize the now horizontally stretched space
	//	such that left (-1.5) results in 1.5, and right also
	//	so toward the center (0) only is black. 
	m = abs(uv.x);	//	for vertical rays
	//m = abs(uv.y);	//	the same but for a horizontally rays
	//	Decomment either of the two to see effect.
	col += m;

	gl_FragColor = vec4(col, 1.0f);
}

void DrawLightWithRaysV2()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	uv *= 3.0;

	vec3 col = vec3(0);

	float d = length(uv);
	float m = .05 / d;
	col += m;	//	visualize the star center


	//	The star rays that go vertical and horizontal
	float invsz = 10.0f;	//	make the rays thinner, making sz larger
	m = abs(uv.x * uv.y * invsz);	//	But it goes from black center to white outer, so do
	//m = 1.0 - abs(uv.x * uv.y * invsz);

	col += m;

	gl_FragColor = vec4(col, 1.0f);
}

void DrawLightWithRaysV3()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	uv *= 3.0;

	vec3 col = vec3(0);

	float d = length(uv);
	float m = .02 / d;
	col += m;	//	visualize the star center


	//	The star rays that go vertical and horizontal
	float invsz = 10.0f;	//	make the rays thinner, making sz larger
	// m = abs(uv.x * uv.y * invsz);	//	But it goes from black center to white outer, so do
	m = 1.0 - abs(uv.x * uv.y * invsz);

	col += m;

	gl_FragColor = vec4(col, 1.0f);
}

void DrawLightWithRaysV4()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	uv *= 3.0;

	vec3 col = vec3(0);

	float d = length(uv);
	float m = .05 / d;
	col += m;	//	visualize the star center

	//	Finally
	float invsz = 1000.0;	//	The larger this is, the smaller the star
	float rays = 1.0 - abs(uv.x * uv.y * invsz);

	col += rays;

	gl_FragColor = vec4(col, 1.0f);
}

void DrawLightWithRaysV5()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	uv *= 3.0;

	vec3 col = vec3(0);

	float d = length(uv);
	float m = .05 / d;
	col += m;	//	visualize the star center


	//	The star rays that go vertical and horizontal
	//float invsz = 10.0f;	//	make the rays thinner, making sz larger
	//m = abs(uv.x * uv.y * invsz);	//	But it goes from black center to white outer, so do
	//m = 1.0 - abs(uv.x * ub.y * invsz);
	// col += m;

	//	Finally
	// float invsz = 1000.0;	//	The larger this is, the smaller the star
	// float rays = 1.0 - abs(uv.x * uv.y * invsz);
	// col += rays;

	float invsz = 1000.0;	//	The larger this is, the smaller the star
	/**
		Better---	 It ensures that the lowest value is exactly 0.0
		This makes sure that after doing col += rays, no negative values resulting from the
		1.0 - abs(uv.x * uv.y * invsz) cancel out the bright glow from the star core.

		Compare this and DrawLightWithRaysV4 to see the difference
	*/
	float rays= max(0.0, 1.0 - abs(uv.x * uv.y * invsz));
	col += rays;


	gl_FragColor = vec4(col, 1.0f);
}

/***********************************************
************************************************

		DRAWING THE STARS

************************************************
**********************************************/

mat2 Rot2D(float a)
{
	float s = sin(a), c = cos(a);
	return mat2(c, -s, s, c);
}

/**
	The complete star with both the vertical and horizontal, and diagonal
	rays.
	`szf` - size factor controls the size of the star core or center. The bigger it is, the bigger the star.
	`flare` - controls whether or not the ray streaks appear, and to what extent they do appear.

	you can add as many rotated ray part as you want.
*/
float Star(vec2 uv, float szf, float flare)
{
	float d = length(uv);
	float m = szf / d;

	float invsz = 1000.0;
	float rays = max(0.0, 1.0 - abs(uv.x * uv.y * invsz));
	m += rays * flare;	//	Add vertical and horizontal rays

	uv *= Rot2D(3.1415 / 4);	//	Rotate by PI/4 which is 45 degrees
	rays = max(0.0, 1.0 - abs(uv.x * uv.y * invsz));
	m += rays * 0.3 * flare;	//	Adds diagonal rays; The 0.3 makes it less bright; 

	return m;
}

void DrawSingleStar1()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	uv *= 3.0;

	vec3 col = vec3(0);

	/**
		Doing:
			col += Star(uv, 1.0);
		Is same as doing:
			col = vec3(Star(uv, 1.0));
		But not same as doing:
			col = Star(uv, 1.0);
		The first two are correct.
		The latter of the three is incorrect.
	*/
	col += Star(uv, .05, 1.0);

	gl_FragColor = vec4(col, 1.0);
}

void DrawStarGrid1()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;

	col += Star(guv, .05, 1.0);
	//col.rg  = guv;	//	to visualize the color space

	//	To add grid borders/outline
	if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;

	gl_FragColor = vec4(col, 1.0f);
}

/**
	It's a pseudo random generator.
	Called hash21 because it takes a 2D vector and returns a single float value.
*/
float Hash21(vec2 p)
{
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

/**
	Explores changing star grid color based on cell id and randomly; also explores the hash function.
*/
void DrawStarGrid2()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	col += Star(guv, 0.05, 1.0);
	//col.rg  = guv;	//	to visualize the color space

	//	To add grid borders/outline
	if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;

	
	//col.rg += id * 0.4;	//	give stars' cells different colors depending on id
	// col += Hash21(uv);	//	This gives television snow (noise)
	col += Hash21(id);	//	This gives proper random values as it takes only the id of the cell (without fractional part)

	gl_FragColor = vec4(col, 1.0f);
}


/**
	Offsets the stars' positions by random value according to the id of their grid cell
*/
void DrawStarGrid3()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	// col += Star(guv, 0.05, 1.0);
	// col += Star(guv - vec2(0.0, 0.4), 0.05, 1.0);	//	offset by fixed amount

	float randDx = Hash21(id);		//	Random between 0 and 1
	//	Then another pseudorandom gotten from randDx from fractional part after multipling by any value (like 34)
	float randDy = fract(randDx * 34);

	/**
		Subtracted 0.5 from both x and y to keep star in the cell even when offset
		because random offset is between 0 and 1, which can move the star outside its cell.
	*/
	col += Star(guv - (vec2(randDx, randDy) - 0.5), 0.05, 1.0);	//	offset by random amount

	//	To add grid borders/outline
	if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;

	gl_FragColor = vec4(col, 1.0f);
}

/**
	Date: 14-06-2025
	Continues in Part 2 of "Shader Coding: Making a Starfield"
	
	After offsets, it searches neighbouring cells and sums the effect of the glows of neighbouring cells.
	This also makes displaced stars which have some parts outside their cell to still show.

	This considers the 8 neighbours around a single star/cell
*/
void DrawStarGrid4()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	// col += Star(guv, 0.05, 1.0);
	// col += Star(guv - vec2(0.0, 0.4), 0.05, 1.0);	//	offset by fixed amount


	/**
		Each loop iteration should add to the `col` the contribution of a neighbouring star.
		So the positions of those neighbouring star needs to be gotten
	*/
	for (int y=-1; y<=1; y++)
	{
		for (int x=-1; x<=1; x++)
		{
			//	Offset: to get the current neigbouring star's positions
			vec2 offs = vec2(x, y);

			//	Position
			float randDx = Hash21(id + offs);		//	Random between 0 and 1
			float randDy = fract(randDx * 34.0);	//	Another random using randDx as seed

			/**
				Then to get the distance to a neighbouring star in another box/cell,
				the offset has to be considered in the Star function.
				Basically, it's to create the neigbouring star and add its contributions
				to the color space.
			*/
			col += Star(guv - offs - (vec2(randDx, randDy) - 0.5), 0.05, 1.0);
		}
	}

	//	To add grid borders/outline
	// if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;

	gl_FragColor = vec4(col, 1.0f);
}


/**
	This `StarV2` is the second version of the `Star` function.
	It is needed for DrawStarGrid5

	It adds semantics to fade the star's glow with a smoothstep as it approaches
	the edge of its cell/uv space.
*/
float StarV2(vec2 uv, float szf, float flare)
{
	float d = length(uv);
	float m = szf / d;

	float invsz = 1000.0;
	float rays = max(0.0, 1.0 - abs(uv.x * uv.y * invsz));
	m += rays * flare;	//	Add vertical and horizontal rays

	uv *= Rot2D(3.1415 / 4.0);	//	Rotate by PI/4 which is 45 degrees
	rays = max(0.0, 1.0 - abs(uv.x * uv.y * invsz));
	m += rays * 0.3 * flare;	//	Adds diagonal rays; The 0.3 makes it less bright; 

	/*
		Make the star's glow fade out as it approaches the edge of its cell.
		The below makes the light start fading at .2 distance and completely fades out at .5
	*/
	// m *= smoothstep(.5, .2, d);

	/*
		But because of the summation of the brightness of neigbours, the distance to completely fade out
		at can be increased to 1.0.
		This gives a wider glow.
	*/
	// m *= smoothstep(0.7, .2, d);
	m *= smoothstep(1.0, .2, d);

	return m;
}

/**
	After the previous, DrawStarGrid4, this one
	properly considers the 8 neighbours around a single star/cell
	fixing the issues from the previous.

	Date: Thursday 19th June, 2025

	The solution was to cut out the glow of the stars to some extent.
	That is, limit each star's glow to its cell; make it fade out to some extent at the edge of its cell.

	After, in reality each star's brightness only goes so far. It doesn't illuminate to the next star (not talking about the sun
	but of other stars in the night sky.)
*/
void DrawStarGrid5()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= 3.0;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	// col += Star(guv, 0.05, 1.0);
	// col += Star(guv - vec2(0.0, 0.4), 0.05, 1.0);	//	offset by fixed amount


	/**
		Each loop iteration should add to the `col` the contribution of a neighbouring star.
		So the positions of those neighbouring star needs to be gotten
	*/
	for (int y=-1; y<=1; y++)
	{
		for (int x=-1; x<=1; x++)
		{
			//	Offset: to get the current neigbouring star's positions
			vec2 offs = vec2(x, y);

			//	Position
			float randDx = Hash21(id + offs);		//	Random between 0 and 1
			float randDy = fract(randDx * 34.0);	//	Another random using randDx as seed

			/**
				Then to get the distance to a neighbouring star in another box/cell,
				the offset has to be considered in the Star function.
				Basically, it's to create the neigbouring star and add its contributions
				to the color space.
			*/
			col += StarV2(guv - offs - (vec2(randDx, randDy) - 0.5), 0.05, 1.0);
		}
	}

	//	To add grid borders/outline
	if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;

	gl_FragColor = vec4(col, 1.0f);
}

/**
	This version 6 modifies each star's size, and affects the flare size based on the size.

	The solution below, using the variable trv allows me to scale to 5.0 without seeing the artifacts.

	In the end, the issue was with my Laptop's OpenGL graphics.
	Or maybe some setting; but it was certainly not a typo or mistake
	with semantics
*/
void DrawStarGrid6()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	float scale = 6.0;
	//	The below is to zoom out so coordinates go from -1.5 to 1.5
	uv *= scale;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	/**
		Each loop iteration should add to the `col` the contribution of a neighbouring star.
		So the positions of those neighbouring star needs to be gotten
	*/
	// int trv = int(floor(scale/2));
	int lower = -1;
	int upper = 1;
	for (int y=lower; y<=upper; y++)
	{
		for (int x=lower; x<=upper; x++)
		{
			//	Offset: to get the current neigbouring star's positions
			vec2 offs = vec2(x, y);

			//	Position
			//	Change hash to affect constellation
			float randDx = Hash21(id + offs);		//	Random between 0 and 1
			float randDy = fract(randDx * 34.0);	//	Another random using randDx as seed

			//	Random Sizes
			// float size = fract(randDx * 789.633);
			// float size = fract(randDx * 577.6314);
			float size = fract(randDx * 345.32);		//	The one by The Art of Code

			/**
				The smoothstep on the flare argument makes it that only stars larger than 0.85
				will have a flare. Those smaller wouldn't
			*/
			float star = StarV2(guv - offs - vec2(randDx, randDy) + 0.5, 0.05, smoothstep(0.9, 1.0, size) * 0.6);

			//	Random Colors using a sin wave

			//	Makes purple like stars
			// vec3 color = sin(vec3(0.6, 0.3, 0.79));

			//	Makes red like stars
			// vec3 color = sin(vec3(0.86, 0.3, 0.29));

			
			//	Makes blue stars --- by Art of Code
			//	The `* 0.5 + 0.5` shifts the range of values to be between 0 and 1

			//	Time changing colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * u_time) * 0.5 + 0.5;

			//	Have to multiple the fract(randDx * 7532.7) by at least 2*PI to actually
			//	get the full phase variations of the sin waves
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 6.2831) * 0.5 + 0.5;

			//	More Diverse Colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 676.2831) * 0.5 + 0.5;

			//	Art of Code's Way
			vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 2345.2) * 123.2) * 0.5 + 0.5;
			
			//	Filter out some colors. The 1.0 + size is because larger stars are more blue
			color = color * vec3(1.0, 0.5, 1.0 + size);


			//	Multiplying by size increases the color of the star's core.
			//	Multiplying by color applies the color.
			col += star * size * color;
		}
	}

	//	To add grid borders/outline
	// if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;
	// col = vec3(guv, 0.0);

	gl_FragColor = vec4(col, 1.0f);
}

/**
	This version 7 fixes the border artifacts that arise in scales greater than 3.0
	At scale 5.0, if I change the neighbour traversal range to be -2 to 2, it fixes.
	But any higher scale is not fixed by changing the traversal range.


		gl_FragCoord == u_resolution

		But doing this (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
		results in a space like this:
		x-axis moves from -0.5 to 0.5
		y-axis moves from -0.8 to 0.8, because of the aspect ratio correction.

		The aspect ratio is really 16/8
	Still, changing the aspect ratio does not fix the issue of the cell borders
	showing when the space is scaled  

	In the end, the issue was with my Laptop's OpenGL graphics.
	Or maybe some setting; but it was certainly not a typo or mistake
	with semantics
*/
void DrawStarGrid7()
{
	/**
		This was the -0.5 --- 0.5 span that was needed to draw the stars.
		But now in the grid, the `vec2 guv = fract(uv) - 0.5;` replicates
		this; so it is not needed for the main space.

		This main space needs to have a space span of 0 --- 1 for proper
		division into cells.

		When I used this, there was issue with scaling the space
		and still being able to access neighbours.
		vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

		After scaling to 5.0, no matter how I changed the traversal value, there were cell-boundary
		artefacts.
		
		But by changing the space, and applying the aspect ratio transform
		with this:
		vec2 uv = gl_FragCoord.xy / u_resolution.xy;
		float aspectRatioFactor = max(u_resolution.x, u_resolution.y) / min(u_resolution.x, u_resolution.y);
		uv.x *= aspectRatioFactor;

		it worked.
	*/

	vec2 uv = gl_FragCoord.xy / u_resolution.xy;
	float aspectRatioFactor = max(u_resolution.x, u_resolution.y) / min(u_resolution.x, u_resolution.y);
	uv.x *= aspectRatioFactor;
	
	float scale = 10.0;
	//	The below is to zoom out
	uv *= scale;

	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	/**
		Each loop iteration should add to the `col` the contribution of a neighbouring star.
		So the positions of those neighbouring star needs to be gotten
	*/
	int trv = 5;		//	traversal value
	for (int y=-trv; y<=trv; y++)
	{
		for (int x=-trv; x<=trv; x++)
		{
			//	Offset: to get the current neigbouring star's positions
			vec2 offs = vec2(x, y);

			//	Position
			//	Change hash to affect constellation
			float randDx  = Hash21(id + offs);		//	Random between 0 and 1
			float randDy = fract(randDx * 34.0);	//	Another random using randDx as seed

			//	Random Sizes
			// float size = fract(randDx * 789.633);
			// float size = fract(randDx * 577.6314);
			float size = fract(randDx * 345.32);		//	The one by The Art of Code

			//	The smoothstep on the flare argument makes it that only stars larger than 0.85
			//	will have a flare. Those smaller wouldn't
			float star = StarV2(guv - offs - (vec2(randDx, randDy) - 0.5), 0.05, smoothstep(0.7, 1.0, size));

			//	Random Colors using a sin wave

			//	Makes purple like stars
			// vec3 color = sin(vec3(0.6, 0.3, 0.79));

			//	Makes red like stars
			// vec3 color = sin(vec3(0.86, 0.3, 0.29));

			
			//	Makes blue stars --- by Art of Code
			//	The `* 0.5 + 0.5` shifts the range of values to be between 0 and 1

			//	Time changing colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * u_time) * 0.5 + 0.5;

			//	Have to multiple the fract(randDx * 7532.7) by at least 2*PI to actually
			//	get the full phase variations of the sin waves
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 6.2831) * 0.5 + 0.5;

			//	More Diverse Colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 676.2831) * 0.5 + 0.5;

			//	Art of Code's Way
			vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 2345.2) * 123.2) * 0.5 + 0.5;
			
			//	Filter out some colors. The 1.0 + size is because larger stars are more blue
			color = color * vec3(1.0, 0.5, 1.0 * size);


			//	Multiplying by size increases the color of the star's core.
			//	Multiplying by color applies the color.
			col += star * size * color;
		}
	}

	// To add grid borders/outline
	if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;
	// col = vec3(Hash21(id));
	// col = vec3(guv, 0.0);
	// col = vec3(uv, 0.0);

	// vec3 col = vec3(uv.x, uv.y, 0.0);
	gl_FragColor = vec4(col, 1.0f);
}


/**
	Following DrawStarGrid7
	
	Represents a single star layer.

	Must pass in scale to configure span of neighborhood search.
*/
float StarLayer(vec2 uv)
{
	vec3 col = vec3(0.0);

	/**
		grid uv: divides the space into grid;
		Because it takes only the fractional part, all the grid cells go from 0 to 1.
		But remember that the actual uv goes from -1.5 to 1.5 (originally -0.5 to 0.5 but was multiplied by 3.0 above)

		Then subtracting 0.5 makes space go from -0.5 to 0.5 so the middle is at 0.0 for both x and y axes

	*/
	vec2 guv = fract(uv) - 0.5;
	vec2 id = floor(uv);

	/**
		Each loop iteration should add to the `col` the contribution of a neighbouring star.
		So the positions of those neighbouring star needs to be gotten
	*/
	int trv = 1;
	for (int y=-trv; y<=trv; y++)
	{
		for (int x=-trv; x<=trv; x++)
		{
			//	Offset: to get the current neigbouring star's positions
			vec2 offs = vec2(x, y);

			//	Position
			//	Change hash to affect constellation
			float randDx = Hash21(id + offs);		//	Random between 0 and 1
			float randDy = fract(randDx * 34.0);	//	Another random using randDx as seed

			//	Random Sizes
			// float size = fract(randDx * 789.633);
			// float size = fract(randDx * 577.6314);
			float size = fract(randDx * 345.32);		//	The one by The Art of Code

			//	The smoothstep on the flare argument makes it that only stars larger than 0.85
			//	will have a flare. Those smaller wouldn't
			float star = StarV2(guv - offs - (vec2(randDx, randDy) - 0.5), 0.05, smoothstep(0.9, 1.0, size) * .6);

			//	Random Colors using a sin wave

			//	Makes purple like stars
			// vec3 color = sin(vec3(0.6, 0.3, 0.79));

			//	Makes red like stars
			// vec3 color = sin(vec3(0.86, 0.3, 0.29));

			
			//	Makes blue stars --- by Art of Code
			//	The `* 0.5 + 0.5` shifts the range of values to be between 0 and 1

			//	Time changing colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * u_time) * 0.5 + 0.5;

			//	Have to multiple the fract(randDx * 7532.7) by at least 2*PI to actually
			//	get the full phase variations of the sin waves
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 6.2831) * 0.5 + 0.5;

			//	More Diverse Colors
			// vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 7532.7) * 676.2831) * 0.5 + 0.5;

			//	Art of Code's Way
			vec3 color = sin(vec3(0.2, 0.3, 0.9) * fract(randDx * 2345.2) * 123.2) * 0.5 + 0.5;
			
			//	Filter out some colors. The 1.0 + size is because larger stars are more blue
			color = color * vec3(1.0, 0.25, 1.0 + size) + vec3(0.2, 0.2, 0.1) * 2;

			/**
				Multiplying by size increases the color of the star's core.
				Multiplying by color applies the color.
			*/
			star *= sin(u_time * 3. + randDx * 6.2831) * 0.5 + 1.0;
			col += star * size * color;
		}
	}

	//	To add grid borders/outline
	// if (guv.x > 0.48 || guv.y > 0.48) col.r = 1.0;


	return col;
}
// #define NUM_LAYERS 4.0
// void DrawStarLayers()
// {
// 	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

// 	float t = u_time * .02;	//	* 0.1 so it doesn't go too fast

// 	vec3 col = vec3(0.0);

// 	//	Doing 0.1 / NUM_LAYERS does some cool brightning effect
// 	for (float i=0.; i < 1.; i += 1. / NUM_LAYERS)
// 	{
// 		/**
// 			scale was originally 20.0 for star layers at the back, making them smaller
// 			and was 0.5 for those to the front.

// 			But I changed it to be from 6.0 to 2.0, because these scales work well enough
// 			to bypass the scaling issue I encountered
// 			that is an issue with my OpenGL graphics stuff.
// 		*/

// 		/**
// 			Depth increases with time and resets back to 0 when it reaches 1.
// 			This ensures that when a layer gets too far to the front (of screen)
// 			it snaps back.
// 		*/
// 		float depth = fract(i + t);

// 		//	add the time value to move the starfield.
// 		float scale = mix(20., .5, depth);

// 		/**
// 			The fade affects the layers as they get closer to the screen
// 			so that they become darker and dissapear easier.
// 			Hence it doesn't look like it dissapears and pops to the back,
// 			making it more natural
// 		*/
// 		float fade = depth;//*smoothstep(1., .9, depth);
// 		/**
// 			Multiplying by larger number makes the stars smaller.


// 			Goal is that stars closer to the camera are larger

// 			Adding i * 453.2 shifts/translates each layer
// 		*/
// 		// col += StarLayer(uv * scale, scale);
// 		col += StarLayer(uv * scale + i * 453.2) * fade;

// 	}

// 	gl_FragColor = vec4(col, 1.0f);
// }

vec3 StarLayerV2(vec2 uv) {
	vec3 col = vec3(0);
	
    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);
    
    for(int y=-1;y<=1;y++) {
    	for(int x=-1;x<=1;x++) {
            vec2 offs = vec2(x, y);
            
    		float n = Hash21(id+offs); // random between 0 and 1
            float size = fract(n*345.32);
            
    		float star = StarV2(gv-offs-vec2(n, fract(n*34.))+.5, 0.05,smoothstep(.9, 1., size)*.6);
            
            vec3 color = sin(vec3(.2, .3, .9)*fract(n*2345.2)*123.2)*.5+.5;
            color = color*vec3(1,.25,1.+size)+vec3(.2, .2, .1)*2.;
            
            star *= sin(u_time*3.+n*6.2831)*.5+1.;
            col += star*size*color;
        }
    }
    return col;
}

#define NUM_LAYERS 6.0
void DrawStarLayers()
{
	vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;

	float t = u_time * .02;

	vec3 col = vec3(0.0);

	for (float i=0.; i < 1.; i += 1. / NUM_LAYERS)
	{

		float depth = fract(i + t);

		//	add the time value to move the starfield.
		float scale = mix(20., .5, depth);

		float fade = depth;

		col += StarLayer(uv * scale + i * 453.2) * fade;
	}

	gl_FragColor = vec4(col, 1.0f);
}


void main()
{
	// DrawFirstStarFalseLight();
	// DrawFirstStarTrueLight();
	// DrawLightWithRaysV1();
	// DrawLightWithRaysV2();
	// DrawLightWithRaysV3();
	// DrawLightWithRaysV4();
	// DrawLightWithRaysV5();
	// DrawSingleStar1();
	// DrawStarGrid1();
	// DrawStarGrid2();
	// DrawStarGrid3();
	// DrawStarGrid4();
	// DrawStarGrid5();
	// DrawStarGrid6();
	// DrawStarGrid7();
	DrawStarLayers();
};