#   Date: Monday 2nd June, 2025


#   More about Value Noise, by Inigo Quilez

Value Noise Article URL: https://iquilezles.org/articles/morenoise/
Gradient Noise Article URL: https://iquilezles.org/articles/gradientnoise/


#   Derivatives of Value Noise

-   How to calculate them analytically? And what to do with them.


Noise derivatives are used to slightly modify the traditional fbm construction in a very simple way.

>   Consider [this project](https://www.shadertoy.com/view/MdX3Rr) where it was used.

The result is a nicer variety compared to a regular form.

Analytical derivatives computation is much faster and more accurate than the central differences (normal) method, and depending on the fractal sum function (ridged noise, turbulence, etc), analytical normals can be computed for the complete heightmap.

The image is rendered by directly raymarching the procedural function (no normal maps, no materials), only diffuse lighting and fog are used.


##   The Derivatives

Call the 3d Value Noise n(x, y, z). Everythin is the same for any number of dimensions of course. We adopt the usual notation for derivatives

dn(x, y, z) / dx

dn(x, y, z) / dy

dn(x, y, z) / dz

OR

dn / dx
dn / dy
dn / dz

In Short

The (3d) noise function is based on a (tri)linear interpolation of random values at some given lattice points. Something like this:

n = lerp(w, lerp(v, lerp(u, a, b), lerp(u, c, d)),
    lerp(v, lerp(u, e, f), lerp(u, g, h)));


Here u(x), v(y), w(z) are the lines and are normally a cubic or quintic polynomial of the form:

u(x) = 3x^2 - 2x^3

OR

u(x) = 6x^5 -  15x^4 + 10x^3


Now, n(x, y, z) can be expanded as follows

n(u, v, w) = k0 + k1·u + k2·v + k3·w + k4·uv + k5·vw + k6·wu + k7·uvw

with

k0 = a
k1 = b - a
k2 = c - a
k3 = e - a
k4 = a - b - c + d
k5 = a - c - e + g
k6 = a - b - e + f
k7 = -a + b + c - d + e - f - g + h

The derivatives can now be computed easily, for example, for the x dimension:

dn/dx = (k1 + k4·v + k6·w + k7·vw)·u'(x)


with

u'(x) = 6·x·(1-x)   

OR

u'(x) = 30·x2(x2 - 2x + 1)

u'(x) depends on whether we chose the cubic or quintic u(x) function above.

Thus, its quite easy to make a function that returns the noise value and the three derivatives in one go, makeing it extremely cheap compared to the central difference method, that is 5 times slower.

``` glsl
// returns 3D value noise and its 3 derivatives
vec4 noised( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);

    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-1.0)+2.0);

    float a = myRandomMagic( p+vec3(0,0,0) );
    float b = myRandomMagic( p+vec3(1,0,0) );
    float c = myRandomMagic( p+vec3(0,1,0) );
    float d = myRandomMagic( p+vec3(1,1,0) );
    float e = myRandomMagic( p+vec3(0,0,1) );
    float f = myRandomMagic( p+vec3(1,0,1) );
    float g = myRandomMagic( p+vec3(0,1,1) );
    float h = myRandomMagic( p+vec3(1,1,1) );

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return vec4( -1.0 + 2.0 * (k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z),
            2.0*du *vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                        k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                        k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
```

>   Example of the code [here](https://www.shadertoy.com/view/XsXfRH)


##   Fbm Derivatives

The fBM (Fractional Brownian Motion) is normally implemented as a fractal sum of Value Noise functions.

```
    fbm(x, y, x) = SUM[n, i=1] * w^i * noise(s^i * x, s^i * y, s^i * z)
```

With w = 1/2 and s = 2, or something close, normally.
When s = 2, each iteration is called an `octave` --- for the doubling of the frequency, like in music.

The total dericative is in that case the weighted sum of the derivatives for each octave, as in regular derivative rules.

If one implements a ridged Value Noise or other variation, one can also easily derive the right way to combine the derivatives, unless you have a discontinuous shaping function like a`fabsf()`

``` glsl

    // returns 3D fbm and its 3 derivatives
    vec4 fbm( in vec3 x, in int octaves )
    {
        float f = 1.98;  // could be 2.0
        float s = 0.49;  // could be 0.5
        float a = 0.0;
        float b = 0.5;
        vec3  d = vec3(0.0,0.0,0.0);
        mat3  m = mat3(1.0,0.0,0.0,
                    0.0,1.0,0.0,
                    0.0,0.0,1.0);
        for( int i=0; i<octaves; i++ )
        {
            vec4 n = noised(x);
            a += b*n.x;          // accumulate values
            d += b*m*n.yzw;      // accumulate derivatives
            b *= s;
            x = f*m3*x;
            m = f*m3i*m;
        }
        return vec4( a, d );
    }

```

Having derivatives available is useful for other purposes. For example, derivatives of noise allow us to compute analytic normals without central differences. In the case of raymarching a terrain, this can be super useful if normals are needed at each raymarching step (for example, to determine if tress grow or not at a given point based on slope).

Similarly, when doing volumetric raymarching of clouds, having analytic normals (extracted from noise derivatives) without resorting to central differences can make the whole algorithm up to 6x faster (depending on how the central differences are implemented).

>   Consider this [realtime raymarched forest landscape](https://www.shadertoy.com/view/4ttSWf)

>   Consider [this code](https://www.shadertoy.com/view/XttSz2) that has rock surface normals computed analytically without central differences, by using the code above that was recently explained.


##  Other Uses

Another use of noise derivatives is to modify the fbm() construction to achieve different looks. For example, it is enough to inject the derivatives in the core of the fbm, which allows one to simulate different erosion-like effects and creates some rich variety of shapes to the terrain, with flat areas as well as more rough areas.

>   Consider [This Image](../../_resources/ValueNoiseDerivative-ErosionEffect-Cubic.jpg)
    -   It was rendered with cubic u(x)

>   Consider [This Image](../../_resources/ValueNoiseDerivative-ErosionEffect-Quintic.jpg)
    -   It was rendered with quintic u(x)

Below is the code used to generate the images above. Note how the cubic version has some discontinuity artefacts, due to the non-continuity of the second derivatives of u(X) and therefore of the fbm function.

```
    const mat2 m = mat2(0.8,-0.6,0.6,0.8);

    float terrain( in vec2 p )
    {
        float a = 0.0;
        float b = 1.0;
        vec2  d = vec2(0.0,0.0);
        for( int i=0; i<15; i++ )
        {
            vec3 n=noised(p);
            d += n.yz;
            a += b*n.x/(1.0+dot(d,d));
            b *= 0.5;
            p = m*p*2.0;
        }
        return a;
    }
```

>   See the live quintic version [here on shadertoy](https://www.shadertoy.com/view/MdX3Rr)