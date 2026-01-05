#   Date: Monday 2nd June, 2025

#   From the [Book of Shaders](https://thebookofshaders.com/13/)

#   Chapter 9: Fractal Brownian Motion

Fractal Brownian Motion is an interpretation on noise.
To understand it, let's consider what waves are and their properties.

A wave is a fluctuation of some property over time. E.g. Audio waves being the fluctuation of air pressure with time, electromagnetic waves being electrical and magnetic fields' fluctuation with time.

#   Properties of a Wave
*   Frequency and Amplitude.

The equation for a simple linear (one-dimensional) wave is this:

``` glsl

    float amplitude = 1.0;
    float frequency = 1.0;
    y = mplitude * sin(x * frequency);
```

-   You can change the values of the frequency and amplitude to understand how they behave.
-   Using shaping functions, change the amplitude over time.
-   Using shaping functions, change the frequency over time.

>   Consider the l1 and l2 files for `wave_modulation.glsl`

#   Using Perlin Noise in Place of a Sine Wave

Perlin Noise's amplitude and frequency varies in a way, but the amplitude remains reasonably consistent, and the frequency is restricted to a fairly narrow range around a center frequency.

It's not as regular as a sine wave as it's easier to create an appearance of randomness by summing up several scaled several scaled versions of noise.

It is possible to make a sum of sine waves appear random as well, but it takes many different waves to hide their periodic, regular nature.

By adding different iterations (and hence scales) of noise (octaves), where we successively increment the frequencies in regular steps (lacunarity) and decrease the amplitude (gain) of the **noise**, one can obtain a finer granularit in the noise, and get more fine detail.

This is the technique, ***Fractal Brownian Motion (fBM)***, or simply ***Fractal Noise***, and in its simplest form, it can be created by the following code:

``` glsl

    //  Properties
    const int octaves = 1;
    float lacunarity = 2.0;
    float gain = 0.5;

    //  Initial Values
    float amplitude = 0.5;
    float frequency = 1.0;

    //  Loop of Octaves 
    for (int i=0; i < octaves; i++){
        y += amplitude * noise(frequency * x);
        frequency *= lacunarity;
        amplitude *= gain;
    }
```

>   Consider files series, l3 and greater for `fBM.glsl`

*   By progressively changing the number of octabes to iterate from 1 to 2, 4, 8, and 10 to see what occurs.

    *   Changing the octaves affects the size, of the waves.

*   When you have more than 4 octaves, try changing the lacunarity value.

*   Also, with > 4 octaves, change the gain value and see what happens.

You'll notice that with each additional octave, the curve seems to get more detail. Also, consider the self-similarity as more octaves are added.

Now, if you zoom in on the curve, a smaller part looks about the same as the whole thing, and each section looks almost exactly the same as any other section. This is the property that identifies mathematical fractals. This property is simulated in the loop.

However, this is not a *true* fractal because the summation is stopped after a few iterations. But theoretically speaking, one would get a true mathematical fractal if the loop was allowed  to continue forever and an infinite number of noise components are continually added.

In computer graphics, howeverm there is always a limit to the smallest details one can resolve. For example, when objects become smaller than a pixel, there is no need to make infinite sums to create the appearance of a fractal. Sometimes, a lot of terms may be needed. But never an infinite number.


#   The Technique and Procedural Generation

The self-similariy of the fBM function is perfect for constructing mountainous landsacapes. Hence for procedural landscapes/

This is because the rosion processes that create mointains work in a manner that yields such self-similarity across a large range of scales.

>   Consider [this article](http://www.iquilezles.org/www/articles/morenoise/morenoise.htm) by Inigo Quiles about advanced value noise. It is done in [here](fBM-NOTES2-advanced_val.md) as well as [this one](https://iquilezles.org/articles/gradientnoise/) for advanced gradient noise done in [here](fBM-NOTES3-advanced_grad)

Using the same technique from the paper, it's possible to obtain other effects like what is known as turbulence.

It's essentially an fBM, but constructed from the absolute value of a signed noise to create sharp valleys in the function.

```glsl

    for (int i=0; i < OCTAVES; i++)
    {
        value += amplitude * abs(snoise(st));
        st *= 2.0;
        amplitude *= 0.5;
    }
```
>   Consider `l5-fBM_turbulence.glsl` [here](https://thebookofshaders.com/edit.php#13/turbulence.frag) and `l6-fBM_ridge.glsl` [here](https://thebookofshaders.com/edit.php#13/ridge.frag)

#   Turbulence
In `l5-fBM_turbulence.glsl`, the **Turbulence** is shown.
It's essentially an fBm, but constructed from the absolute value of a signed noise to create sharp valleys in the function.

Key Code:
``` glsl

    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * abs(snoise(st));
        st *= 2.;
        amplitude *= .5;
    }
```

#   Ridge
In `l6-fBM_ridge.glsl`, the **Ridge** is shown.
Here, the sharp valleys are turned upside doen to create sharp ridges instead:

Key Code:
``` glsl

    n = abs(n);     // create creases
    n = offset - n; // invert so creases are at top
    n = n * n;      // sharpen creases
```



##  Consider These Too --- Multifractals

*   Another variant of the Fractal Brownian Noise effect used to create cool variations is to multiply the noise components together instead of adding them.

*   It can also be useful to scale subsequent noise functions with something that depends on the previous terms in the loop.

When things are done this way, it moves away from the strict definition of a fractal and into the relatively unknown field of ***Multifractals***.

***Multifractals*** are not strictly defined mathematically. They yet remain useful in graphics.

Multifractal simulations are very common in modern commercial software for terrain generation.

>   Further reading: Chapter 16 of "Texturing and Modeling: a Procedural Approach"(3rd edition), by Kenton Musgrave.


#  Domain Warping

Consider [this article](http://www.iquilezles.org/www/articles/warp/warp.htm) by Inigo Quiles; I do it in [here](fBM-NOTES4-quiles_domain_warping.md)

**here, he wrote about how it's possible to use fBM to warp a space of an `fBM`**.

    -   [The Picture](../../_resources/Quiles-DomainWarping.jpg)
    -   f(p) = fbm(p + fbm(p + fbm(p))), by Inigp Quiles (2002)

But the code in `l7-domain_warping.glsl` shows a less extreme example of the technique. Here, the wrap is used to produce the cloud-like texture. See that self-similarity property is still present in the result.

Here is the code:

```glsl
    
    // Author @patriciogv - 2015
    // http://patriciogonzalezvivo.com

    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    float random (in vec2 _st) {
        return fract(sin(dot(_st.xy,
                            vec2(12.9898,78.233)))*
            43758.5453123);
    }

    // Based on Morgan McGuire @morgan3d
    // https://www.shadertoy.com/view/4dS3Wd
    float noise (in vec2 _st) {
        vec2 i = floor(_st);
        vec2 f = fract(_st);

        // Four corners in 2D of a tile
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }

    #define NUM_OCTAVES 5

    float fbm ( in vec2 _st) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        // Rotate to reduce axial bias
        mat2 rot = mat2(cos(0.5), sin(0.5),
                        -sin(0.5), cos(0.50));
        for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(_st);
            _st = rot * _st * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy*3.;
        // st += st * abs(sin(u_time*0.1)*3.0);
        vec3 color = vec3(0.0);

        vec2 q = vec2(0.);
        q.x = fbm( st + 0.00*u_time);
        q.y = fbm( st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*u_time );
        r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*u_time);

        float f = fbm(st+r);

        color = mix(vec3(0.101961,0.619608,0.666667),
                    vec3(0.666667,0.666667,0.498039),
                    clamp((f*f)*4.0,0.0,1.0));

        color = mix(color,
                    vec3(0,0,0.164706),
                    clamp(length(q),0.0,1.0));

        color = mix(color,
                    vec3(0.666667,1,1),
                    clamp(length(r.x),0.0,1.0));

        gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color,1.);
    }
```


Warping the texture coordinates with noise in this manner can be wuite useful.
With it, you can produce a lot of cool effects.

A useful use of this is to displace the coordinates with the derivative (gradient)
of the noise.

Some modern implementations of Perlin noise include a variant that computes both the function and
its analytical gradient.

If the `true` gradient is not available for a procedural function, you can always compute
finite differences to approximate it, although this is less accurate and involves more work.