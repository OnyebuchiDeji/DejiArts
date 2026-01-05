#version 330 core


uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;



int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 0.01;

/**
    Demonstrating rendering more shapes!
*/

/**
    Cynlinder Signed Distance Function

    It's formula is similar to the capsule!

    *   A closed cylinder!

    *   It's like that of a capsule without the clamp
    *   `t = dot(ap, ab) / dot(ab, ab)`
    *   `c = A + t * ab`
    *   `d = length(p-c) - radius`
    *   this d is the perpendicular distance of camera point P
        to the lengthwise-infinite cylinder.
        That is, the perpendicular distance to the vertical sides of the
        cylinder


    *   but now if P was located above or below the cylinder, P....
    that is, above or below the horizontal flat faces of the cylinder
    the distance `e` from P to any point on that flat face is calculated this way:
    *   `y = (abs(t - 0.5) - 0.5)`
        -   remember t goes from 0 to 1 even without the clamp
            as long as it's within the cylinder from points A to B
        -   the above formula folds the t value so that any distance from P
        by any ray that's outside the line segment AB, the value becomes positive
        and at A and B, the value is 0 but any intermediary value within A and B
        is negative
    *   now, because t is normalized, it has to be anormalized so that it scales
        properly with length ab:
        `y = (abs(t - 0.5) - 0.5) * length(ab)`
        
    *   `e = length(max(vec2(d, y), 0))`
        -   Notice the max --- it's the same thing with the sides of the box
    
    *   There's also the interior distance:
        -   `i = min(max(d, y), 0)`
        -   It's done such that if the ray reaches a point very close to the edge of the cylinder
        but is inside of the cylinder, that value is negative.
        -   and if the point is very close but outside the cylinder, its positive
        -   `max(d, y)` inidicates that 
    *   Final Distance, `D = e + i`
*/

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    //  get point c
    vec3 c = a + t * ab;
     
    // x is d for the capsul
    float x = length(p - c) - r;

    float y = (abs(t - 0.5) - 0.5) * length(ab);
    float e = length(max(vec2(x, y), 0));

    //  without interior distance, there'll be artefacts!
    float i = min(max(x, y), 0);

    return e + i;
}

/** The Box
    A non-rotated box from the origin

    *   box origin, BO, and camera point, P, is relative to
    that origin and lies outside the box in the scene

    *   There are two cases for the box's distance (sdf)
    1.  when the camera point is at a bottom or top edge
    *   distance `d = length(vec2(dx, dy))`
    *   dy = vertical distance of point P from bottom or top edge minus the box vetical size (half-size)
        where size.y is half the length of the actual vertical size of the box like a circle's radius
        `dy = abs(p.y) - size.y` where size.y is the half size of the vertical size of the box
    *   dx = same as dy but for horizonatl components!
        `dx = abs(p.x) - size.x`
        here, abs is used because whether P is negative or not is not considered --- only distance is needed
        size.x is the box half-size.
    *   so `d = lenght(abs(p) - size)` since both dx and dy are calculated the same way
    2.  when the camera is perpendicular/directly above the horizontal sides of the box!
        since the point when hovering over the side of the box, the y component of P
        becomes negative since abs(p.y) - size.y when p.y is not above or below (vertically) the box
        results in a negative value since p.y will be less than size.y
        so to accomomdate this:
        `d = length(max(abs(p) - size, 0))`
        the max ensures that any negtive value from `abs(p) - size` is replaced with distance 0
        to obtain the right result!
*/

float sdBox(vec3 p, vec3 bO, vec3 s)
{
    p = p - bO; //  let the origin be displaced from camera point P
    return length(max(abs(p) - s, 0));
}

/**
    The Torus

    Torus Singed Distance Function
    >   draw these things to try to understand!
    *   Consider a donut shape in a scene! 
    *   Consider it is made up of a single large circle that's flat along the XZ
        plane with origin O
    *   And then at the edge of the large circle, a smaller circle lieing on the YZ plane
        with its center on the edge of the larger circle at point C
            -   this smaller circle is used to obtain the girth of the donut!
    *   Consider the camera point P lieing outside that shape.
        P's posiiton is considered using the origin of the torus, O, as P's origin
    *   P is some distance y above the XZ plane that the torus lies on!
    *   Distance: The distance, `d` from point p to the smaller circle center, C
    *   P casts a shadow on the XZ plane (since its above it) called Pxz. 
    *   Pxz is the distance of P from the origin along plane xz
    *   So to find Pxz - C, `x`, `x = length(Pxz) - r1` where r1 is the radius
        of the bigger circle 
    *   Hence the P - x - C form a right-angled triangle so pythagoras can be 
        used to find `d` which is length PC.
    *   Since length (P - Pxz) is Py (distance of p from xz plane)...
    *   `d = length(vec2(x, y)) - r2` where r2 is the radius of smaller circle!
*/
float sdTorus(vec3 p, vec3 tO, vec2 r)
{
    //  notice the subtraction because wer're going from
    //  tO to p hence p - tO
    //  because the origin of the shapes are displaced from the 
    //  camera point P
    p = p - tO;
    float x = length(p.xz) - r.x;
    return length(vec2(x, p.y)) - r.y;
}

/**

    Capsule Signed Distance Function:
    Consider it as an extruded sphere. Two spheres connected 
    together.
    *   Brief: Get shortest distance from the camera point along each ray direction
    to the line segmenet that goes through the center of the endpoints of the two spheres
    and then subtract the sphere's radius

    *   Consider the line segment to be AB and camera point is p
    The point p lies outside the capsule somewhere in space
    
    *   To find the shortest distance, pc, from p to the line segment AB...
    where the point on the line segmenet marking the shortest distance is AC 
    *   So, when p is hovering perpendicularly over A, length AC is zero 
    *   So, when p is hovering perpendicularly over B, length AC is one
    *   t = length(AC) = dot(ap, ab) / dot(ab, ab)
        `dot(ab, ap)` is the shadow of ap cast on ab which gives the length AC
        `dot(ab, ab)` is the length AB, used to normalize the length `dot(ap, ab)` which is length AC
    *   then to find the point c, `c = A + t * ab` --- starting from point A iwth length AC gotten
    according to the position of camera, along direction vector ab
    *   but befofre that, clamp t to be between 0 and 1 so any value less than 0 or greater
    than 1 is not considered, ensuring t sticks to endpoints AB so point `c` cannot
    appear outside the line segment
        `c = A + t * ab`
    *   Distance: `d = length(p-c) - radius`
        finally find the distance between p and c, and subtract radius (just as with sphere)
*/


float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b - a;
    vec3 ap = p - a;

    float t = dot(ab, ap) / dot(ab, ab);
    //  ensure projected value doesn't fall outside the line segment AB
    t = clamp(t, 0.0, 1.0);

    //  get point c
    vec3 c = a + t * ab;
     
    //  return distance!
    return length(p - c) - r;
}

float GetDist(vec3 p)
{
    vec4 s = vec4(0.0, 1.0, 6.0, 1.0);  //  x, y, z, radius 
    float sphereDist = length(p - s.xyz) - s.w; //   s.w is radius
    float planeDist = p.y;

    float cd = sdCapsule(p, vec3(-1, 1, 6), vec3(1, 2, 6), .2);
    //  note if I didn't implmeent origin vec3 argument
    //  I will have to do p - O, where O is the origin
    //  this will displace p properly relative to the origin
    //  the origin being where the shapes below lie (because of how
    //  their formulas are done!)
    //  the result is the shapes origin's displaced relative to the point P
    //  since P is the camera it should control where the shapes are placed!
    //  but I choose to do the `p - O` within the signed distance functions!
    float td = sdTorus(p, vec3(0, .5, 6), vec2(1.5, .2));
    float bd = sdBox(p, vec3(-2.9, .75, 6), vec3(.75));
    float cyld = sdCylinder(p, vec3(0.0, 0.35, 3), vec3(2, 0.35, 5), .3);
    // float d = min(sphereDist, planeDist);
    float d = min(cd, planeDist);
    d = min(d, td);
    d = min(d, bd);
    d = min(d, cyld);


    return d;
}


float RayMarch(vec3 ro, vec3 rd)
{
    float dO = 0.;
    for (int i=0; i < MAX_STEPS; i++)
    {
        //  start at origin and march certain distance dO in
        //  ray direction rd
        vec3 p = ro + rd * dO;
        //  get the distance of the point from scene along the ray direction
        float dS = GetDist(p);
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }
    return dO;
}

vec3 GetNormal(vec3 p)
{
    float d = GetDist(p);
    //  e.x is the small distance value
    vec2 e = vec2(.01, 0);

    vec3 n = d - vec3(
        GetDist(p - e.xyy),
        GetDist(p - e.yxy),
        GetDist(p - e.yyx)
    );

    return normalize(n);
}

float GetLight(vec3 p)
{
    vec3 lightPos = vec3(0.0, 5.0, 6.0);

    //  move light position around
    lightPos.xz += vec2(sin(u_time), cos(u_time)) * 2.0;

    //  Note! p is the point that resulted from hitting an
    //  object on the scene's surface

    //  vector from p to light position
    vec3 l = normalize(lightPos - p);
    //  hence, the normal to p considers
    //  the points very close to p on that surface
    vec3 n = GetNormal(p);

    //  since the rsult is between -1 to 1, clamp it
    // float dif = dot(n, l);
    float dif = clamp(dot(n, l), 0.0, 1.0);

    //  Obtain soft shadow
    /**
        by ray marching toward scene object from point p in the direction of the light
        if the distance from the raymarch gotten is smaller than the distan
        to the light, it means an object in the scene is in its way.
        Hence, at that point, draw a shadow since an object is obviously between
        the point and the light source! 

        Note that point p is the point that is already on the surface of the
        scene object. Because of this, once the RayMarch loop below to detect for a shadow
        is run, it immediately returns since the point p is already so close to the
        scene object.

        So to ensure the below works, move the point p away from the object's surface
        in the direction of the normal

        Notice the * 2.0; it's to increase the distance from the scene shader
        for the below to work properly and remove artefacts!
    */
    float d = RayMarch(p + n * SURF_DIST * 2.0, l);

    //  check if the distance is less than the distance from the point
    //  and the light source, verifying being in the shadow!
    if (d < length(lightPos - p)) dif *= .1;

    return dif;
}


void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

    vec3 col = vec3(0);
    
    //  setting up camera

    //  ray origin
    vec3 ro = vec3(0, 2., 0);// moved camera upwards ro.y:  from 1.0 -> 2.0
    //  every possible direction
    //  used with ray origin to shoot ray to every direction on the screen
    //  uv.y - 0.2 to make camera look down
    vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0)); 

    //  find if ray intersection occurs for that pixel
    //  and color to draw

    float d = RayMarch(ro, rd);

    //  first method for visualization
    //  doing this because the minimum distance is higher than 1
    // d /= 6.0;
    // col = vec3(d);

    //  second method for visualization
    vec3 p = ro + rd * d;

    float dif = GetLight(p);
    col = vec3(dif);

    //  test GetNormal function by visualization
    // col = GetNormal(p);
    

    gl_FragColor = vec4(col, 1.0);
}