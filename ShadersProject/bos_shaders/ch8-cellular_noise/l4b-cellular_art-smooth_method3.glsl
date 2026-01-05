/**
    Date: Monday 2nd June, 2025

    Paper on Smoothing The Cellular patterns generated using the Cellular Noise algorithm

    By Inigo Quilez
    URL: https://iquilezles.org/articles/smoothvoronoi/
*/


/**
    ALTERNATIVES

    Continuing from l4, here are alternative solutions for smoothing the cellular pattern.


    One of the issues with the smooth minimums proposed above, is that they use relatively expensive exponential or power functions.
    The upside is that both produce associative smooth minimum, which means that the final value for the smooth minimum doesn't depend on the order in which the cells in the voronoi are processed.
    In reality, cheaper alternatives such as the polynomial smooth minimum described in this other article will most likely end up in your implementation.
    Such a polynomial smooth minimum is no longer associative, but in practice I've never seen this being a problem,
    since the cell processing order is always fixed anyways and therefore the results always consistent.
    
    The following is an example of a smooth voronoi pattern implemented with a polynomial smooth minimum
    (you have the source code and realtime demo here in Shadertoy: [LINK](https://www.shadertoy.com/view/ldB3zc)

*/

// The MIT License
// Copyright © 2014 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Smooth Voronoi - avoiding aliasing, by replacing the usual min() function, which is
// discontinuous, with a smooth version. That can help preventing some aliasing, and also
// provides with more artistic control of the final procedural textures/models.

// More Voronoi shaders:
//
// Exact edges:  https://www.shadertoy.com/view/ldl3W8
// Hierarchical: https://www.shadertoy.com/view/Xll3zX
// Smooth:       https://www.shadertoy.com/view/ldB3zc
// Voronoise:    https://www.shadertoy.com/view/Xd23Dh

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;



float hash1( float n ) { return fract(sin(n)*43758.5453); }
vec2  hash2( vec2  p ) { p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) ); return fract(sin(p)*43758.5453); }

// The parameter w controls the smoothness
vec4 voronoi( in vec2 x, float w )
{
    vec2 n = floor( x );
    vec2 f = fract( x );

	vec4 m = vec4( 8.0, 0.0, 0.0, 0.0 );
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
        vec2 o = hash2( n + g );
		
		// animate
        o = 0.5 + 0.5*sin( u_time + 6.2831*o );

        // distance to cell		
		float d = length(g - f + o);
		
        // cell color
		vec3 col = 0.5 + 0.5*sin( hash1(dot(n+g,vec2(7.0,113.0)))*2.5 + 3.5 + vec3(2.0,3.0,0.0));
        // in linear space
        col = col*col;
        
        // do the smooth min for colors and distances		
		float h = smoothstep( -1.0, 1.0, (m.x-d)/w );
	    m.x   = mix( m.x,     d, h ) - h*(1.0-h)*w/(1.0+3.0*w); // distance
		m.yzw = mix( m.yzw, col, h ) - h*(1.0-h)*w/(1.0+3.0*w); // color
    }
	
	return m;
}

void main()
{
    vec2  p = gl_FragCoord/u_resolution.y;
    float c = 0.5*u_resolution.x/u_resolution.y;
	
    vec4 v = voronoi( 6.0*p, p.x<c?0.001:0.3 );

    // gamma
    vec3 col = sqrt(v.yzw);
	
	col *= 1.0 - 0.8*v.x*step(p.y,0.33);
	col *= mix(v.x,1.0,step(p.y,0.66));
	
    
	col *= smoothstep( 0.003, 0.005, abs(p.y-0.33) );
	col *= smoothstep( 0.003, 0.005, abs(p.y-0.66) );
    col *= smoothstep( 0.003, 0.005, abs(p.x-c) );
	
    gl_FragColor = vec4( col, 1.0 );
}
