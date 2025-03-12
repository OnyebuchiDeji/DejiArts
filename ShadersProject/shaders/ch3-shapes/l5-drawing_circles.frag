

/**
    Date: Fri-20-Dec-2024 -- Sun-22-Dec-2024

    Shapes: Drawing Circles
*/

void circle_eg1()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    pct = distance(st, vec2(0.5));

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(0.5) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    // vec2 tC = vec2(0.5) - st;
    // pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    vec3 color = vec3(pct);

    gl_FragColor = vec4(color, 1.0);
}

void circle_eg2()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    // pct = distance(st, vec2(0.5));

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(0.5) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    vec2 tC = vec2(0.5) - st;
    pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    pct = step(0.5, pct);
    pct = 1 - pct;

    vec3 color = vec3(pct);

    gl_FragColor = vec4(color, 1.0);
}

void circle_eg3(float rad, vec2 center)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    pct = distance(st, vec2(center.x, center.y));

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(center.x, center.y) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    // vec2 tC = vec2(center.x, center.y) - st;
    // pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    pct = step(rad, pct);
    pct = 1 - pct;

    vec3 color = vec3(pct);

    gl_FragColor = vec4(color, 1.0);
}

void circle_eg4(float rad, vec2 center, float boundary, bool invert)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    pct = distance(st, vec2(center.x, center.y));

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(center.x, center.y) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    // vec2 tC = vec2(center.x, center.y) - st;
    // pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    pct = smoothstep(rad, rad - boundary, pct);
    pct = 1 - pct;

    vec3 color = vec3(pct);
    if (invert)
    {
        color = 1 - color;
    }

    gl_FragColor = vec4(color, 1.0);
}

void circle_eg5(float rad, vec2 center, float boundary, bool invert)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    // pct = distance(st, vec2(center.x-0.1, center.y-0.1)) + distance(st, vec2(center.x+0.1, center.y+0.1));
    // pct = distance(st, vec2(center.x-0.1, center.y-0.1)) * distance(st, vec2(center.x+0.1, center.y+0.1));
    // pct = min(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));
    // pct = max(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));
    pct = pow(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(center.x, center.y) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    // vec2 tC = vec2(center.x, center.y) - st;
    // pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    pct = step(rad, pct);

    pct = smoothstep(rad, rad - boundary, pct);

    pct = 1 - pct;

    vec3 color = vec3(pct);
    if (invert)
    {
        color = 1 - color;
    }

    gl_FragColor = vec4(color, 1.0);
}

void circle_eg6(float rad, vec2 center, float boundary, bool isStep, bool invert, int mode)
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    float pct = 0.0;

    //  a.  The DISTANCE from the pixel to the center
    if (mode == 0)
    {
        pct = distance(st, vec2(center.x-0.1, center.y-0.1)) + distance(st, vec2(center.x+0.1, center.y+0.1));
    }
    else if (mode == 1)
    {
        pct = distance(st, vec2(center.x-0.1, center.y-0.1)) * distance(st, vec2(center.x+0.1, center.y+0.1));
    }
    else if (mode == 2)
    {
        pct = min(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));
    }
    else if (mode == 3)
    {
        pct = max(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));
    }
    else{
        pct = pow(distance(st, vec2(center.x-0.1, center.y-0.1)), distance(st, vec2(center.x+0.1, center.y+0.1)));
    }

    //  b.  The LENGTH of the vector from the pixel to the center
    // vec2 toCenter = vec2(center.x, center.y) - st;
    // pct = length(toCenter);

    //  c.  The SQUARE ROOT of the vector from the pixel to the center
    // vec2 tC = vec2(center.x, center.y) - st;
    // pct = sqrt(tC.x * tC.x + tC.y * tC.y);

    if (isStep)
    {
        pct = step(rad, pct);
    }
    else{
        pct = smoothstep(rad, rad - boundary, pct);
    }
    pct = 1 - pct;

    vec3 color = vec3(pct);
    if (invert)
    {
        color = 1 - color;
    }

    gl_FragColor = vec4(color, 1.0);
}

float circle_eg7(in vec2 _st, in float _radius)
{
    vec2 dist = _st - vec2(0.5);
    return 1. - smoothstep(_radius - (_radius * 0.01), _radius + (_radius * 0.01), dot(dist, dist) * 4.0);
}


void main()
{
    // circle_eg1();
    // circle_eg2();
    // circle_eg3(0.2, vec2(0.5, 0.5));
    vec2 nm = norm_mouse();
    // circle_eg4(0.2, vec2(0.5, 0.5), 0.03,false);
    // circle_eg4(0.45 * abs(sin(u_time)) + 0.05, vec2(nm.x, nm.y), 0.03, false);
    // circle_eg5(0.45 * abs(sin(u_time)) + 0.1, vec2(nm.x, nm.y), 0.03, true);
    circle_eg6(0.25 * abs(sin(u_time)) + 0.1, vec2(nm.x, nm.y), 0.03, false, false, 0);

    // vec2 st = gl_FragCoord.xy / u_resolution;
    // vec3 color = vec3(circle_eg7(st, 0.65));
    // gl_FragColor = vec4(color, 1.0);
}