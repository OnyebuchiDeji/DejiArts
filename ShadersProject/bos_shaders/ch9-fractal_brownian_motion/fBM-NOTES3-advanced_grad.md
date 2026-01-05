#   Date: Monday 2nd June, 2025


#   More about Gradient Noise, by Inigo Quilez

URLS:

Gradient Noise Article URL: https://iquilezles.org/articles/gradientnoise/

Value Noise Article URL: https://iquilezles.org/articles/morenoise/


#   Derivatives of Gradient Noise

Similar to [ANalytical derivatives of value noise](https://iquilezles.org/articles/morenoise), Gradient Noise (the name used for variations and generalizations of Perlin Noise) accepts analytical computation of derivatives.

Just like with Value Noise derivatives, this allows for much faster lighting computations or any other computation that requires gradients/normals based on the noise since we non longer need to approximate it through numerical methods that involve taking multiple samples of the noise.


#   The Code

Assuming we have some standard Gradient Noise implementation, like the code directly below, the computation of the derivatives involves only a few more computations, as shown afterwards.

``` glsl

    // returns 3D value noise
    float noise( in vec3 x )
    {
        // grid
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        // quintic interpolant
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);

        
        // gradients
        vec3 ga = hash( p+vec3(0.0,0.0,0.0) );
        vec3 gb = hash( p+vec3(1.0,0.0,0.0) );
        vec3 gc = hash( p+vec3(0.0,1.0,0.0) );
        vec3 gd = hash( p+vec3(1.0,1.0,0.0) );
        vec3 ge = hash( p+vec3(0.0,0.0,1.0) );
        vec3 gf = hash( p+vec3(1.0,0.0,1.0) );
        vec3 gg = hash( p+vec3(0.0,1.0,1.0) );
        vec3 gh = hash( p+vec3(1.0,1.0,1.0) );
        
        // projections
        float va = dot( ga, w-vec3(0.0,0.0,0.0) );
        float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
        float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
        float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
        float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
        float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
        float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
        float vh = dot( gh, w-vec3(1.0,1.0,1.0) );
        
        // interpolation
        return va + 
            u.x*(vb-va) + 
            u.y*(vc-va) + 
            u.z*(ve-va) + 
            u.x*u.y*(va-vb-vc+vd) + 
            u.y*u.z*(va-vc-ve+vg) + 
            u.z*u.x*(va-vb-ve+vf) + 
            u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);
    }

```

The below code shows the computation for the derivatives:

```glsl

    // returns 3D value noise (in .x)  and its derivatives (in .yzw)

    vec4 noised( in vec3 x )
    {
        // grid
        vec3 p = floor(x);
        vec3 w = fract(x);
        
        // quintic interpolant
        vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
        vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
        
        // gradients
        vec3 ga = hash( p+vec3(0.0,0.0,0.0) );
        vec3 gb = hash( p+vec3(1.0,0.0,0.0) );
        vec3 gc = hash( p+vec3(0.0,1.0,0.0) );
        vec3 gd = hash( p+vec3(1.0,1.0,0.0) );
        vec3 ge = hash( p+vec3(0.0,0.0,1.0) );
        vec3 gf = hash( p+vec3(1.0,0.0,1.0) );
        vec3 gg = hash( p+vec3(0.0,1.0,1.0) );
        vec3 gh = hash( p+vec3(1.0,1.0,1.0) );
        
        // projections
        float va = dot( ga, w-vec3(0.0,0.0,0.0) );
        float vb = dot( gb, w-vec3(1.0,0.0,0.0) );
        float vc = dot( gc, w-vec3(0.0,1.0,0.0) );
        float vd = dot( gd, w-vec3(1.0,1.0,0.0) );
        float ve = dot( ge, w-vec3(0.0,0.0,1.0) );
        float vf = dot( gf, w-vec3(1.0,0.0,1.0) );
        float vg = dot( gg, w-vec3(0.0,1.0,1.0) );
        float vh = dot( gh, w-vec3(1.0,1.0,1.0) );
        
        // interpolation
        float v = va + 
                u.x*(vb-va) + 
                u.y*(vc-va) + 
                u.z*(ve-va) + 
                u.x*u.y*(va-vb-vc+vd) + 
                u.y*u.z*(va-vc-ve+vg) + 
                u.z*u.x*(va-vb-ve+vf) + 
                u.x*u.y*u.z*(-va+vb+vc-vd+ve-vf-vg+vh);
                
        vec3 d = ga + 
                u.x*(gb-ga) + 
                u.y*(gc-ga) + 
                u.z*(ge-ga) + 
                u.x*u.y*(ga-gb-gc+gd) + 
                u.y*u.z*(ga-gc-ge+gg) + 
                u.z*u.x*(ga-gb-ge+gf) + 
                u.x*u.y*u.z*(-ga+gb+gc-gd+ge-gf-gg+gh) +   
                
                du * (vec3(vb-va,vc-va,ve-va) + 
                    u.yzx*vec3(va-vb-vc+vd,va-vc-ve+vg,va-vb-ve+vf) + 
                    u.zxy*vec3(va-vb-ve+vf,va-vb-vc+vd,va-vc-ve+vg) + 
                    u.yzx*u.zxy*(-va+vb+vc-vd+ve-vf-vg+vh) ));
                    
        return vec4( v, d );                   
    }

```

>   Consider the implementation of the above [here](https://www.shadertoy.com/view/4dffRH)



##  For 2D

The code gets naturally smaller:

```glsl

    // returns 3D value noise (in .x)  and its derivatives (in .yz)
    vec3 noised( in vec2 x )
    {
        vec2 i = floor( p );
        vec2 f = fract( p );

        vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
        vec2 du = 30.0*f*f*(f*(f-2.0)+1.0);
        
        vec2 ga = hash( i + vec2(0.0,0.0) );
        vec2 gb = hash( i + vec2(1.0,0.0) );
        vec2 gc = hash( i + vec2(0.0,1.0) );
        vec2 gd = hash( i + vec2(1.0,1.0) );
        
        float va = dot( ga, f - vec2(0.0,0.0) );
        float vb = dot( gb, f - vec2(1.0,0.0) );
        float vc = dot( gc, f - vec2(0.0,1.0) );
        float vd = dot( gd, f - vec2(1.0,1.0) );

        return vec3( va + u.x*(vb-va) + u.y*(vc-va) + u.x*u.y*(va-vb-vc+vd),   // value
                    ga + u.x*(gb-ga) + u.y*(gc-ga) + u.x*u.y*(ga-gb-gc+gd) +  // derivatives
                    du * (u.yx*(va-vb-vc+vd) + vec2(vb,vc) - va));
    }

```

>   Consider the implementation [here](https://www.shadertoy.com/view/XdXBRH)