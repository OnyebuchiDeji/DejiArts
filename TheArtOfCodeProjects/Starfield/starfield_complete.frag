#version 330 core

/**
    Date: 20th June, 2025

    My Comment:

    If your run this, you'll see the grid lines' artefacts
    I was struggling with in the second episode of the series
    of videos.

    It turns out I indeed didn't make a mistake. This was purely an
    issue with my Latptop's OpenGL graphics. Maybe perhaps even a setting.
*/

// Starfield Tutorial by Martijn Steinrucken aka BigWings - 2020
// countfrolic@gmail.com
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// 
// This is the end result of a tutorial on my YouTube channel The Art of Code
// 


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



#define NUM_LAYERS 4.

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float Star(vec2 uv, float flare) {
	float d = length(uv);
    float m = .05/d;
    
    float rays = max(0., 1.-abs(uv.x*uv.y*1000.));
    m += rays*flare;
    uv *= Rot(3.1415/4.);
    rays = max(0., 1.-abs(uv.x*uv.y*1000.));
    m += rays*.3*flare;
    
    m *= smoothstep(1., .2, d);
    return m;
}

float Hash21(vec2 p) {
    p = fract(p*vec2(123.34, 456.21));
    p += dot(p, p+45.32);
    return fract(p.x*p.y);
}

vec3 StarLayer(vec2 uv) {
	vec3 col = vec3(0);
	
    vec2 gv = fract(uv)-.5;
    vec2 id = floor(uv);
    
    for(int y=-1;y<=1;y++) {
    	for(int x=-1;x<=1;x++) {
            vec2 offs = vec2(x, y);
            
    		float n = Hash21(id+offs); // random between 0 and 1
            float size = fract(n*345.32);
            
    		float star = Star(gv-offs-vec2(n, fract(n*34.))+.5, smoothstep(.9, 1., size)*.6);
            
            vec3 color = sin(vec3(.2, .3, .9)*fract(n*2345.2)*123.2)*.5+.5;
            color = color*vec3(1,.25,1.+size)+vec3(.2, .2, .1)*2.;
            
            star *= sin(u_time*3.+n*6.2831)*.5+1.;
            col += star*size*color;
        }
    }
    return col;
}

void main()
{
    vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	// vec2 M = (iMouse.xy-u_resolution.xy*.5)/u_resolution.y;

    //  norm_mouse does all the above, moving mouse coordinates to 1---1 space
	vec2 M = norm_mouse(u_mouse).xy;
    
    float t = u_time*.02;
    
    uv += M*4.;
    
    uv *= Rot(t);
    vec3 col = vec3(0);
    
    for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
    	float depth = fract(i+t);
        
        float scale = mix(20., .5, depth);
        float fade = depth*smoothstep(1., .9, depth);
        col += StarLayer(uv*scale+i*453.2-M)*fade;
    }
    
    col = pow(col, vec3(.4545));	// gamma correction
    
    gl_FragColor = vec4(col,1.0);
}