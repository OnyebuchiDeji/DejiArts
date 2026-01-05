#   Date: Monday 2nd June, 2025


#   Domain Warping, by Inigo Quilez

URL: https://iquilezles.org/articles/warp/


#   Warping Domain Distortion

It is used for generating procedural textures and geometry.

It's often used to pinch, stretch, twist, bend, thicken or apply any other deformation, on an object.

>   Consider [this article by Inigo Quiles](https://iquilezles.org/articles/distfunctions) for many SDF shape construction formulas.

This technique works as long as one's base color pattern or geometry is defined as a function of space.

This article is going to show just a particular case of warping --- noise based warping or a noise function.

It's been used since 1984, when Ken Perlin.

Consider the image: [Domain Warp](../../_resources/gfx00-domain_warp.jpg)

    -   Image for f(p) = fbm(p + fbm(p + fbm(p)))


##  The Basics

If you have geometry or an image defined as a function of space... for geometry, that would be a dunction of the form f(x, y, z) and for an image, f(x, y).

One can just write both cases more compactly as f(p), wehre p is the position in space for which the volumetric density that will define the **(iso)surface** or **image color** can be evaluated.

>   An isosurface is a three-dimensional analog of an isoline.

Warping simply means we distort the domain with another function g(p) before we evaluate **f**. Basically, we replace f(p) with f(f(p)).

**g** can be anything, but often we want to distort the image of **f** just a little bit with respect to its regular behavior.

Then, it makes sense to have g(p) being just the identity plus a small arbitrary distortion h(p), or in other words,...

g(p) = p + h(p)

meaning we will be computing:

f(p + h(p))

This technique is really powerful and allows you to shape aples, buildings, animals, or any other thing you might imagine.

For the purpose of this article, we are going to work only with fBM based patterns, both for **f** and **h**. This will produce some abstract but beautiful images with a pretty organic quality to them.


##  The IDEA

The code shows the use of some standard [fBM](https://iquilezles.org/articles/fbm) which is a simple sum of noise waves with increasing frequencies and decreasing amplitudes.

A simple fBM is displayed in the first image [here](../../_resources/gfx04-SimpleFBM.jpg). The code is like this:

```
    float pattern(in vec2 p)
    {
        return fbm(p);
    }
```

We can now add a first domain warping (second image [here](../../_resources/gfx03-FBMWarped.jpg)):

```
    float pattern( in vec2 p)
    {
        vec2 q = vec2(
            fbm( p + vec2(0.0, 0.0)),
            fbm( p + vec2(5.2, 1.3))
        );
        return fbm(p + 4.0 * q);
    }
```

Note how we use two 1-dimensional fBM calls to emulate a 2-dimensional fBM, which is what we need in order to displave a point in 2 dimensions.

Lastly, we add the second warping [image here](../../_resources/gfx02-FBMSecondWarping.jpg)

```glsl

    float pattern( in vec2 p )
    {
        vec2 q = vec2( fbm( p + vec2(0.0,0.0) ),
                    fbm( p + vec2(5.2,1.3) ) );

        vec2 r = vec2( fbm( p + 4.0*q + vec2(1.7,9.2) ),
                    fbm( p + 4.0*q + vec2(8.3,2.8) ) );

        return fbm( p + 4.0*r );
    }
```

Note that those particular offset values in the 2-dimensional FBM emulation through 1-dimensional fbm() calls don't have any special meaning.
They are used to get different fBM values by using one single fbm() implementation.


##   The Experiments

*   Time Parameter
>   Consider [this video](../../_resources/vid00-fbmWarpingExperiments.mp4) that shows some fbm domain warping experiments. In this video, time is added as a parameter tpo apply some animations.

*   Color Parameter
A color palette can be simply mapped to the density values. But this is not enough.
We want to use the internal values of the function to get some extra color patterns and shapes.

After all, there are three fBM functions that do change the internal structure of our final image, so we can use those too to get some extra coloring.

The first we have to do, then, is to actually expose those values to the outside world
    -   The exposing is done by marking the parameters of the function out-parameters, meaning the values they hold that are changed within the function is reflected also outside the function --- **basically, the object is passed into the function call by reference, so its value can now be changed by the function since its value is not simply copied.** 

So, **both the density values and internal values of the function are used to produce the colouring.**

```glsl

    float pattern( in vec2 p, out vec2 q, out vec2 r )
    {
        q.x = fbm( p + vec2(0.0,0.0) );
        q.y = fbm( p + vec2(5.2,1.3) );

        r.x = fbm( p + 4.0*q + vec2(1.7,9.2) );
        r.y = fbm( p + 4.0*q + vec2(8.3,2.8) );

        return fbm( p + 4.0 * r );
    }
```

Now the colors can be gotten: one could start from a simple color ramp based on *f*, then mix the color to a third one based on the magnitude of *q* and finally mix to a forth one based on the vertical component of *r*.

Of course, **that is just one of the infinite amount of possibilities and techniques that one can perform here**. In either case, doing so results in some nice colored image, like [this one](../../_resources/gfx05-coloredFBMWarping.jpg)

>   Consider this video showing a colored FBM Warping [here](../../_resources/vid01-coloredFBMWarping.mp4)

>   Here is the [URL to the code](https://www.shadertoy.com/view/4s23zz)

>   I do it [here from Quiles](l8-fBM_colored_warping.glsl)