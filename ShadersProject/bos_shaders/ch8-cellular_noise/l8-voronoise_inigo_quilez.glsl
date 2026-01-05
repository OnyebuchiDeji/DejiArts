/**
    Date: Monday 2nd June, 2025

    Paper on Voronoise --- noise generated using the voronoi algorithm
    For smoother, more natural patterns.

    It's actually a combination of Voronoi and noise.


    By Inigo Quilez
    URL: https://iquilezles.org/articles/voronoise/
*/


/**
    INTRO


    Two of the most common building blocks for procedural pattern generation are Noise,
    which have many variations (Perlin's being the first and most relevant), and Voronoi (also known as "celular") which also has different variations.
    For Voronoi, the most common of those variations is the one that splits the domain in a regular grid such that there's one feature point in each of the cells.
    That means that Voronoi patterns are based on a grid after all just like Noise, the difference being that while in Noise the feature originators are in the vertices of the grid (random values or random gradients),
    Voronoi has the feature generators jittered somewhere in the grid.
    That might be a first indicator that, perhaps, the two patterns are not that unrelated, at least from an implementation perspective?

    Despite this similarity, the fact is that the way the grid is used in both patterns is different.
    Noise interpolates/averages random values (as in value noise) or gradients (as in gradient noise),
    while Voronoi computes the distance to the closest feature point. Now, smooth-bilinear interpolation and
    minimum evaluation are two very different operations, or... are they? Can they perhaps be combined in a more general metric?
    If that was so, then both Noise and Voronoi patterns could be seen as particular cases of a more general grid-based pattern genereator?

    This article is about a small effort to find such generalized pattern. Of course, the code implementing such generalization will never be
    as fast as implementations of the particular cases (rendering this articles with no obvious immediate practical purpose), but at least it might
    open the window to a bigger picture understanding and perhaps, one day, new findings!
*/


/**
    THE CODE

    In order to generalize Voronoi and Noise, we must introduced two parameters:
    one to control the amount of jittering of the feature points, and one for controling the metric.
    Let's call the grid control parameter u, and the metric controller v.

    The grid parameter is pretty simple to design: u=0 will simply use a Noise-like regular grid,
    and u=1 will be the Voronoi-like jittered grid. So, the value of u can simply control the amount of jitter. Straightforward.

    The v parameters will have to blend between a Noise-like bilinear interpolator of values,
    and a Voronoi-like min operator. The main difficulty here is that the min() operation is a non-continuous function.
    However, luckily enough for us, there are smooth alternatives such as the Smooth Voronoi.
    If we apply a power functions to the distance to each feature points in order to highlight the closest one over the rest,
    then we get a nice side effect: using a power of 1 gives all features the same relevance and therefore we get an equal interpolation of features,
    which is what we need for Noise-like patterns! So, something like this might do it:

    float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), 64.0 - 63.0*v );

    However, a bit of experimentation proves that a better perceptually linear interpolation between the Noise-like
    and the Voronoi-like pattern can be achieved by rising v to some power:

    float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), 1.0 + 63.0*pow(1.0-v,4.0) );

    So, it seems that after all it's not so difficult to generalize Noise and Vonoroi.
    Therefore, assuming one has a way to generate random values deterministically as a function of the grid cell id
    (which you are already doing both in your favorite Voronoi and Noise implementations), which we could call

    vec3 hash3( in vec2 p )

    then the code for our new generalized super pattern could be like this:

    (The implementation is very similar to the regular Voronoi pattern,
    the difference being that we now have the weighted average of distance computations happening
    the accumulation happens in wa and the counting for later normalization is in wt).

*/

float noise( in vec2 x, float u, float v )
{
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0 + 63.0*pow(1.0-v,4.0);
    float va = 0.0;
    float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2  g = vec2( float(i), float(j) );
        vec3  o = hash3( p + g )*vec3(u,u,1.0);
        vec2  r = g - f + o.xy;
        float d = dot(r,r);
        float w = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += w*o.z;
        wt += w;
    }

    return va/wt;
}

/**
    Results

    The results of the generalization are rather interesting. 
    Of course, we have generalized Noise and Voronoi. Indeed, noise happens when u=0, v=1, ie, regular grid
    and interpolation of feature distances. Voronoi happens when u=1, v=0, ie, when the grid is jittered and
    the metric is the minimum distance.

    However there's two side effects. The first happens when u=0, v=0,
    which gives a minimum distance to a non jittered grid of features. This basically gives a patten with a constant value per grid cell,
    or what normally is called "cell noise".

    The second side effect happens for u=1, v=1, which generates a pattern that has an interpolated value of distances to features in a jittered grid.
    It's a combination of Voronoi and Noise, or as I am naming it, Voronoise (top right in the image).
    This pattern can be useful for regular procedural generation where grid artifacts are visible,
    because the jittering certainly hides the underlaying grid structure of Noise.

    Consider the image in `resources/gfx01.jpg`. It's from the webpage URL referenced here
    This describes the image:
    Botton Left: u=0, v=0: Cell Noise
    Bottom Right: u=0, v=1: Noise
    Top Left: u=1, v=0: Voronoi
    Top Right: u=1, v=1: Voronoise


    Source URL: https://www.shadertoy.com/view/Xd23Dh
*/



// The MIT License
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
// Copyright © 2014 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// This is a procedural pattern that has 2 parameters, that generalizes cell-noise, 
// perlin-noise and voronoi, all of which can be written in terms of the former as:
//
// cellnoise(x) = pattern(0,0,x)
// perlin(x) = pattern(0,1,x)
// voronoi(x) = pattern(1,0,x)
//
// From this generalization of the three famouse patterns, a new one (which I call 
// "Voronoise") emerges naturally. It's like perlin noise a bit, but within a jittered 
// grid like voronoi):
//
// voronoise(x) = pattern(1,1,x)
//
// Not sure what one would use this generalization for, because it's slightly slower 
// than perlin or voronoise (and certainly much slower than cell noise), and in the 
// end as a shading TD you just want one or another depending of the type of visual 
// features you are looking for, I can't see a blending being needed in real life.  
// But well, if only for the math fun it was worth trying. And they say a bit of 
// mathturbation can be healthy anyway!
//
// More info here: https://iquilezles.org/articles/voronoise

// More Voronoi shaders:
//
// Exact edges:  https://www.shadertoy.com/view/ldl3W8
// Hierarchical: https://www.shadertoy.com/view/Xll3zX
// Smooth:       https://www.shadertoy.com/view/ldB3zc
// Voronoise:    https://www.shadertoy.com/view/Xd23Dh

// All noise functions here:
//
// https://www.shadertoy.com/playlist/fXlXzf&from=0&num=12

vec2 norm_mouse(vec2 og_mouse_coord)
{
    //  To normalize mouse uniforms, specifically made for the clicked mouse ones
    float mouse_y = u_resolution.y - og_mouse_coord.y;
    vec2 nm = vec2(smoothstep(0, u_resolution.x, og_mouse_coord.x), smoothstep(0.0, u_resolution.y, mouse_y));
    return nm;
}

vec3 hash3( vec2 p )
{
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
				   dot(p,vec2(269.5,183.3)), 
				   dot(p,vec2(419.2,371.9)) );
	return fract(sin(q)*43758.5453);
}

float voronoise( in vec2 p, float u, float v )
{
	float k = 1.0+63.0*pow(1.0-v,6.0);

    vec2 i = floor(p);
    vec2 f = fract(p);
    
	vec2 a = vec2(0.0,0.0);
    for( int y=-2; y<=2; y++ )
    for( int x=-2; x<=2; x++ )
    {
        vec2  g = vec2( x, y );
		vec3  o = hash3( i + g )*vec3(u,u,1.0);
		vec2  d = g - f + o.xy;
		float w = pow( 1.0-smoothstep(0.0,1.414,length(d)), k );
		a += vec2(o.z*w,w);
    }
	
    return a.x/a.y;
}

void main()
{
	vec2 uv = gl_FragCoord / u_resolution.xx;

    vec2 p = 0.5 - 0.5*cos( u_time+vec2(0.0,2.0) );
    
    vec4 mouse = 
	if( u_mouse.w>0.001 ) p = vec2(0.0,1.0) + vec2(1.0,-1.0)*u_mouse.xy/u_resolution.xy;
	
	p = p*p*(3.0-2.0*p);
	p = p*p*(3.0-2.0*p);
	p = p*p*(3.0-2.0*p);
	
	float f = voronoise( 24.0*uv, p.x, p.y );
	
	gl_FragColor = vec4( f, f, f, 1.0 );
}

