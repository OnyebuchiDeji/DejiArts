#version 330 core

/**
    Episode 0 --- From "RayMarching for Dummies!"
    This episode actually came after the Episode 1
    "RayMarching Simple Shapes" 
*/

uniform vec2 u_resolution;
uniform float u_time;

//  can't defome MACROS
int MAX_STEPS = 100;
float MAX_DIST = 100.;
float SURF_DIST = 0.01;


/**
    GetDist Function:

    Gets the distance from a point (camera's position) along ray
    to objects of the scene.
    Used by the RayMarch to detect a hit!

    It's also called the SDF or Signed-Distance-Function

    Consider the objects: A Plane and A Sphere

    Plane: getting the distance to a plane is as simple as
    finding how high or below the plane the camera
    point is --- a vertical distance --- such that
    `dPlane` = camera.y - plane.y

    Sphere: getting that of the sphere is as simple as
    finding the distance between the cameraPos and spherePos and sphereRadius
    since what's wanted is the distance to the sphere's surface.
    `dSphere` = length(spherePos - cameraPos) - sphereRadius

    `dMarch`: Since both these objects can exist in the same scene
    and one can be in front of the other, the object whose distance from
    the camera point along the ray is the smallest is what's chosen...
    so `dMarch` = min(dPlane, dSpehere)
*/
float GetDist(vec3 p)
{
    vec4 s = vec4(0.0, 1.0, 6.0, 1.0);  //  x, y, z, radius 
    float sphereDist = length(p - s.xyz) - s.w; //   s.w is radius
    float planeDist = p.y;
    float d = min(sphereDist, planeDist);
    return d;
}


/**
    RayMarch Function:
    *   Takes in ray origin and direction
    *   loops up till a maximum no. onf steps MAX_STEPS
    *   p = point after projection or shooting ray:
    shoots ray from origin at a certain distance in each direction
    corresponding to the current pixel being worked on
    *   dS = distance to scene: Uses GetDist to get distance of that ray to the scene
    *   dO = distance from origin: starts from zero, then is incermented by the obtained distance
    *   post-condition = checks if the distance ray travelled, dS was so close
    to the scene it has basically hit the scene (or any object in it), OR
    dO has become too big, in which case the Ray March should stop lest it
    go to infiinity, hitting nothing.
    *   returns dO
*/
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

/**
    Simple Lighting

    GetLight: Consider that when a light ray comes in perpendicular
    to a surface, its effect is stronger.

    But if it comes in at an angle up to being parallel, its
    effect becomes weaker.
    
    The dot product models this effect properly as if the angle
    between two vectors is wide, the dot product tends to negative 1
    but when closer being aligned (narrower angle), it approaches 1

    Note the vectors should be the same length; hence nomrmalized
    light = dot(lightVector, NormalVector)
    lightVector = normalize(lightPos - surfacePos)

    GetNormal: Normal Vector using formula for the slope of a curve
    remember that the formula for slipe of a curve resulted in
    the normal of the point for circles.
*/

vec3 GetNormal(vec3 p)
{
    float d = GetDist(p);
    //  e.x is the small distance value
    vec2 e = vec2(.01, 0);

    /**
        Consider the use od the swizzle to access the values
        of e accordingly

        Below is finding the distance from the scene objects
        to the area around ray point on the object.
        It'll use this to find the slope values for all three dimensions
        This results in the normal (especially for a circle and sphere and most
        other simple shapes!)
    */
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
    vec3 ro = vec3(0, 1, 0);
    //  every possible direction
    //  used with ray origin to shoot ray to every direction
    //  on the screen
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));

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