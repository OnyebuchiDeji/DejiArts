#version 330 core

/**

    2D Matrices

    Learn how to move shapes using pre-defined matrices

    Date: Mon-23-Dec-2024
*/


#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define HALF_PI 1.5707963267948966

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouse_click1;
uniform vec2 u_mouse_click2;
uniform float u_time;


//  -------------------------------------------------------------------------
//          THE UTIL FUNCTIONS
//  -------------------------------------------------------------------------


vec2 norm_mouse()
{
    float mouse_y = u_resolution.y - u_mouse.y;

    //   Though the solution using smoothstep is:
    vec2 nm = vec2(smoothstep(0, u_resolution.x, u_mouse.x), smoothstep(0.0, u_resolution.y, mouse_y));

    //  This one is the first I got before figuring out the smoothstep one.
    // vec2 nm = vec2(u_mouse.x / u_resolution.x, mouse_y / u_resolution.y);

    return nm;
}

//  ---------------------------------------------------------------


/**
    Date: Mon-23-Dec-2024
    
    Consider this code that moves the shape drawn by modifying the pixels' coordinate system.
    This is similart ot how the triangle was made to move in the last chapter/lesson...
    It is done by adding a vvector to the coordinate system variable, st, which controls the location of each fragment.

    The formula for drawing boxes of specific size is shown below.

    Notice that there is no code to modify the positions...
    this is because the way they modify the positions is different from how I did mine in the previous chapters.
    This method moves the shape by moving the shape's whole coordinate space.
    This is similar to the way the triangle is moved in the chapter before this.
    Likewise for rotation, it rotates it by rotating the shape's coordinate space.
    
*/

float box(in vec2 _st, in vec2 _size)
{
    _size = vec2(0.5) - _size*0.5;
    vec2 uv = smoothstep(_size, _size + vec2(0.001), _st);
    uv *= smoothstep(_size, _size + vec2(0.001), vec2(1.0) - _st);
    return uv.x * uv.y;
}

float cross(in vec2 _st, float _size)
{
    //  Two boxes aginst each other. Same center, different widths.
    return box(_st, vec2(_size, _size/4.)) + box(_st, vec2(_size/4., _size));
}


void draw_eg1_translation()
{
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    //  To move the cross we move the space.
    vec2 translate = vec2(cos(u_time), sin(u_time));
    st += translate * 0.35;

    //  See how the coordinates of the space on the background
    //  change with the position of the shape.
    color = vec3(st.x, st.y, 0.0);

    //  Add the shape on the foreground
    color += vec3(cross(st, 0.25));

    gl_FragColor = vec4(color, 1.0);
}


/**
    Rotating objects also requires the entire spacce system to be moved.
    For this, a matrix is used.
    Matrix: organised set of numbers in columns and rows.

    Vectors are multiplied by matrices following a specific method to modify
    the vectors' values in a unique way.

    M1 = [  a b
            c d ]
    M1 * [x, y] = [  ax + by
                     cx + dy]
    
    M2 = [  a b c
            d e f
            0 0 1]
    M2 * [x, y, 1] = [ax + by + x, dx + ey + f, 1]

    M3 = [  a b c
            d e f
            g h i]
    M3 * [x, y, z] = [ax + by + cz, dx + ey + fz, gx + hy + iz]

    M4 = [  a b c d
            e f g h
            i j k l
            0 0 0 1]
    M5 * [x, y, z, 1] = [ax + by + cz + d, ex + fy + gz + h, ix + iy + kz + l, 1]

    GLSL has native support for two, three, and four-dimensional matrices:
        mat2 (2x2), mat3 (3x3), mat4 (4x4)
    It also supports operations on matrices...
    such as matrix multiplication (*)
    and a matrix specific function, `matrixCompMult()`

    Also, based on how matrices behave, it's possible to construct  matrices to produce specific behaviors.
    Mt = [
        1 0 tx
        0 1 ty
        0 0 1
    ]
    Mt * [x y 1] = [x + tx, y + ty, 1]

    Now, to rotate the coordinate system:

    Mr = [
        cos(a) -sin(a)  0
        sin(A) cos(a)   0
        0       0       1
    ]
    Mr * [x y z] = [x*cos(a) - y*sin(a), x * sin(a) + y * cos(a), 1]
*/

/**
    This constructs and returns a 2D matrix for rotating a point.

    However, this formula follows the above that rotates a 2d vector coordinate
    around the vec2(0.0) point.

    BUT the cross shape is drawin in the canvas's center at pos vec2(0.5)///
    so before rotating with this matrix, the shape should be moved from the center to vec2(0.0)
    cooridnate, then the space rotated there, and the shape moved back to the original position.
*/
mat2 rotate2d(float _angle)
{
    return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

/**
    Without first translating the coordinate space to vec2(0.0)...
    The rotation matrix acts on all the pixels, rotating them around the vec2(0.0)
    position with the cross shape still positioned at vec2(0.5)...
*/
void draw_eg2_rotations()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    //  Move space from the center to the vec2(0.0)
    st -= vec2(0.5);
    // rotate the space
    st = rotate2d( sin(u_time) * PI ) * st;
    //  Move it back to the original place
    st += vec2(0.5);

    //  Show the coordinates of the space on the background
    color = vec3(st.x, st.y, 0.0);
    
    //  Add the shape on the foreground
    color += vec3(cross(st, 0.4));

    gl_FragColor = vec4(color, 1.0);
}

/**
    Scale:  scaling the size of objects:

    Ms = [  Sx 0 0
            0 Sy 0
            0 0 Sz]
    Ms * [x y z] = [Sx * x, Sy * y, Sz * z]
*/

mat2 scale(vec2 _scale)
{
    return mat2(_scale.x, 0.0, 0.0, _scale.y);
}

/**
    Notice that here also, the coordinate space is translated to vec2(0.0)
    so the object center is is at vec2(0.0) where it can be properly scaled...
    then afterward the coordinate system is translated back to vec2(0.5).

    If this doesn't happen, the coordinate system is scaled normally but the shape
    does not remain at the center:
    // st -= vec2(0.5);
    st = scale(vec2(sin(u_time) + 1.0)) * st;
    // st += vec2(0.5);
*/
void draw_eg3_scale()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st -= vec2(0.5);
    st = scale(vec2(sin(u_time) + 1.0)) * st;
    st += vec2(0.5);

    //  Show the coordinates of the space on the background
     color = vec3(st.x, st.y, 0.0);

    //  Add the shape on the foreground
    color += vec3(cross(st, 0.2));

    gl_FragColor = vec4(color, 1.0);
}

void draw_eg4_rotate_n_scale()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    st -= vec2(0.5);
    st = rotate2d( sin(u_time) * PI ) * scale(vec2(sin(u_time) + 1.0)) * st;

    st += vec2(0.5);

    //  Show the coordinates of the space on the background
    color = vec3(st.x, st.y, 0.0);

    //  Add the shape on the foreground
    color += vec3(cross(st, 0.2));

    gl_FragColor = vec4(color, 1.0);
}



//------------------------------------------------


void main()
{
    // draw_eg1_translation();
    // draw_eg2_rotations();
    // draw_eg3_scale();
    draw_eg4_rotate_n_scale();
}