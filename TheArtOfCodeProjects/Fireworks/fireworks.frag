#version 330 core

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

/**
    Hash 12 because it takes one value and returns two pseudo random values

    However this returns values from within the square-shaped Cartesian Plane

    Lastly, this function must not take 0 as a value, lest both output be stuck at zero

    v is the seed
*/
vec2 Hash12(float v)
{
    float x = fract(sin(v * 674.3) * 453.2);
    float y = fract(sin((v + x) * 714.3) * 263.2);

    return vec2(x, y);
}

/**
    Also a hash12 function, but this returns a pseudo random vec2 based on polar coordinates
    hence preserving the polar coordinate circular space of values
*/
vec2 Hash12_Polar(float v)
{
    //  angle; the fract(sin()) is ass the cartesian, but because it returns a random
    //  between 0 and 1, multiply by 2PI, 6.2832, to return values between 0 and 2PI
    float a = fract(sin(v * 674.3) * 453.2) * 6.2832;
    //  distance
    float d = fract(sin((v + a) * 714.3) * 263.2);

    //  X and Y  polar coordinate if hypotheneus, d
    return vec2(sin(a), cos(a)) * d;
}


#define NUM_EXPLOSIONS 10.0
#define NUM_PARTICLES 100.0


void FirstLight()
{
    //  UV in space -0.5 --- 0.5
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    vec3 col = vec3(0.0);

    //  subtract 0.5 to move output values within -0.5 --- 0.5 space
    vec2 randDir = Hash12(3.0) - 0.5; 

    /**
      Gets the fractional component of time so the light keeps repeating
      its motion, starting again from the origin.
      So this time value animates it.
    */
    float t = fract(u_time);

    //  Finds distance of current pixel from centre of uv at (0, 0)
    //  By doing + or - randDir, I move the origin of the uv space.
    float d = length(uv + randDir * t); 

    /**
        The larger the brightness variable, the larger the core of the light.
        Using this to divide the distance gives an asymptote value at the center or origin of uv
        that is very high but as it goes further from arigin, it decreases exponentially but 
        never reaches zero (another asymptote).
        Hence why its used to make these light effects.
    */
    float brightness = 0.01;    
    col += brightness / d;

    gl_FragColor = vec4(col, 1.0);
}



void SquareLightWorks()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 col = vec3(0.0);

    //  'Tis a constant; doesn't change from loop to loop
    float t = fract(u_time);

    for (float i=0.0; i < NUM_PARTICLES; i++)
    {
        //  Random Direction. Again, - 0.5 to move output to be between -0.5 --- 0.5 space range
        vec2 randDir = Hash12(i + 1.0) - 0.5;
        float t = fract(u_time);

        float d = length(uv - randDir * t);

        float brightness = 0.001;        
        col += brightness / d;
    }
    gl_FragColor = vec4(col, 1.0);
}


void PolarLightWorks()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 col = vec3(0.0);

    //  'Tis a constant; doesn't change from loop to loop
    float t = fract(u_time);

    for (float i=0.0; i < NUM_PARTICLES; i++)
    {
        /**
            Random Polar Direction. No - 0.5 space shift since its polar
            But multiply by 0.5 to make returned values smaller.
        */
        vec2 randDir = Hash12_Polar(i + 1.0) * 0.5;

        float d = length(uv - randDir * t);

        float brightness = 0.001;        
        col += brightness / d;
    }
    gl_FragColor = vec4(col, 1.0);
}

void BetterLightWorks()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 col = vec3(0.0);

    float t = fract(u_time);
    
    for (float i=0.0; i < NUM_PARTICLES; i++)
    {
        /**
            Random Polar Direction. No - 0.5 space shift since its polar
            But multiply by 0.5 to make returned values smaller.
        */
        vec2 randDir = Hash12_Polar(i + 1.0) * 0.5;

        float d = length(uv - randDir * t);

        /**
            Change the brightness based on what part of the animation the fireworks are in
            Ideally, when the animation approaches 1, the brightness should decrease.
            So it should only be bright at the beginning.   
            0.001 is brighter than 0.0005

            smoothstep(a, b, t);

            First arguments: smoothstep(0.1, 0.0, t) <-- from The Art of Code
            
            So the smoothstep makes it be that when the t value is <= b, it returns 1.0, which makes
            the mix value be 0.001, the brightest and biggest, which makes sense since at the start of the fireworks,
            t starts from 0. Then between t = b = 0.0 and t = a = 0.1, the mix value transitions between 0.001 -> 0.0005,
            and when the t value in the smoothstep becomes >= a, smoothstep returns 0.0, which makes the mix function 
            evaluate 0.0005 for the brightness at that point in time.   

            One can reduce the brightness range, and also manipulate the smoothstep parameters a and b

            E.g. This settings:
             mix(0.0001, 0.001, smoothstep(0.9, 0.0, t));
            to me, it's the best, by increasing parameter a, it makes it that even after explosion, the particles are still
            a reasonable size, and like real fireworks, as they burn through the air, they become smaller and less bright
            until they dissapear.
        */
        
        float brightness = mix(0.0001, 0.001, smoothstep(0.9, 0.0, t));             


        //  Adding Individual Sparkles to the Lights

        /**
            This makes all the stars fluctuate on and off.
            The `* 20.0` is just to increase the frequency, for better distance between values on the sin wave phase.
            the `* 0.5 + 0.5 is to move the value range from `-1 to 1.0` to be between `0 to 1.0`
        */
        // brightness *= sin(t * 20.0) * 0.5 + 0.5;
        
        //  Use the i value for particle differentiation
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;
        
        col += brightness / d;
    }
    gl_FragColor = vec4(col, 1.0);
}

/**
    This returns can return single float because the color 
    of all the sparks of the same firework are the same (for most firework types)
*/
float TrueLightWorks(vec2 uv, float t)
{
    float sparks = 0.0;

    for (float i=0.0; i < NUM_PARTICLES; i++)
    {
        vec2 randDir = Hash12_Polar(i + 1.0) * 0.5;
        
        float d = length(uv - randDir * t);
        
        // float brightness = mix(0.0001, 0.001, smoothstep(0.9, 0.0, t));             
        float brightness = mix(0.0005, 0.002, smoothstep(0.05, 0.0, t));             

        //  Adding Individual Sparkles to the Lights
        brightness *= sin(t * 20.0 + i) * 0.5 + 0.5;

        /**
            Make the sparks fade out as they approach the edge
            Basically, when t <= 0.75, smoothstep returns 1.0, so brightness is mupltiplied  
            by 1.0. But when t approaches 1.0, smoothstep returns values < 1.0, until
            finally at t >= 1.0, smoothstep returns 0.0, so brightness is completely darkened.
        */
        brightness *= smoothstep(1.0, 0.75, t);
        
        sparks += brightness / d;
    }
    return sparks;
}

/**
    A single color-changing fireqork explosion
*/
void SingleFireWork()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 col = vec3(0.0);

    /**
        By using flor(u_time), for the entire second, the same color is used.
        But after one second, the color changes.

        To prevent the sin wave from going from 0 --- 1, since at 0 it becomes dark,
        move the output space for the sine wave by doing `* 0.25 + 0.75` so now it's
        output space is from 0.25 --- 1
    */
    vec3 color = sin(vec3(0.34, 0.54, 0.43) * floor(u_time)) * 0.25 + 0.75;

    col += TrueLightWorks(uv, fract(u_time)) * color;

    gl_FragColor = vec4(col, 1.0);
}

/**
    Multiple Firework Explosions
*/
void FireWorks()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    vec3 col = vec3(0.0);


    for (float i=0.0; i < NUM_EXPLOSIONS; i++)
    {
        /**
            the below staggers the time for each explosion.

            If you just do `u_time + i`, it won't change anything for the fireworks
            since they use the fractional component. Hence incrementing by a whole number (i)
            won't change the fractional component.
            But doing `+ i / NUM_EXPLOSIONS`, it adds and modifies the fractional component.
        */
        float t = u_time + i / NUM_EXPLOSIONS;
        float fr_t = fract(t);
        float fl_t = floor(t);

        //  The original. Each moment's fireworks have the same color
        // vec3 color = sin(vec3(0.34, 0.54, 0.43) * fl_t) * 0.25 + 0.75;
        
        //  Similar to original. Still each moment's fireworks have the same color
        // vec3 color = sin(vec3(0.34, 0.54, 0.43) * t) * 0.25 + 0.75;
        
        //  Now, each moment's fireworks have different colors
        vec3 color = sin(vec3(0.34, 0.54, 0.43) * fl_t * fr_t) * 0.25 + 0.75;

        //  Give eash firework explosion a random offset
        vec2 offs =  Hash12(i + 1.0 + fl_t) - 0.5; //  - 0.5 to get vectors between -0.5 and 0.5

        /**
            By multiplying by the x and y components of the below vec2,
            you can control the spread of the different firework explosions

            Because of the aspect ratio, the x-component is 1.77
        */
        offs *= vec2(1.77, 1.0);

        col += TrueLightWorks(uv - offs, fr_t) * color;
    }

    gl_FragColor = vec4(col, 1.0);
}

void main()
{
    // FirstLight();
    // SquareLightWorks();
    // PolarLightWorks();
    // BetterLightWorks();
    // SingleFireWork();
    FireWorks();
}