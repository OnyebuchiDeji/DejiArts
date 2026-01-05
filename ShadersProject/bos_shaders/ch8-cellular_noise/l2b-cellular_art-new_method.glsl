/**
    Date: Monday 2nd June, 2025

    Paper on Smoothing The Cellular patterns generated using the Cellular Noise algorithm

    But this part of the series, l2b, just shows inigo quilez's uniquene implementation

    By Inigo Quilez
    URL: https://iquilezles.org/articles/smoothvoronoi/
*/


/**
    INTRO

    Voronoi patterns are widely used in computer graphics for procedural modelling and shading/texturing.
    However, when used for shading, one has to be extra careful because voronoi signals are discontinuous by definition and therefore difficult to filter.
    That's why normally these patterns are supersampled and baked into textures.
    There are other reasons to prefer baking over procedural evaluation, like filtering under minification, which is a problem with all procedural signals actually.
    Yet, I'd like to give the voronoi pattern a second chance as a procedural primitive, just for the sake of playing around.
    So, lets see if we can fix that ugly discontinuity at its source.
*/

/**
    Usually a voronoi function returns many signals, like the distance, id and position of the closest features.
    To keep things simple, though, lets write a very simple and classic voronoi pattern implementation this time:
*/
float voronoi( in vec2 x )
{
    ivec2 p = floor( x );
    vec2  f = fract( x );

    float res = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        ivec2 b = ivec2( i, j );
        vec2  r = vec2( b ) - f + hash2f( p + b );
        float d = dot( r, r );
        res = min( res, d );
    }
    return sqrt( res );
}
