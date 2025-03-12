#version 330 core

/**
    Date: Wed-11-12-2024, Keele Days

    Algorithmic Drawing

    Advanced Shaping Functions

    References:
        Polynomial Shaping Functions:
            www.flong.com/archive/texts/code/shapers_poly
        Exponential Shaping Functions:
            www.flong.com/archive/texts/code/shapers_exp
        Cubic & Elliptical Shaping Functions:
            www.flong.com/archive/texts/code/shapers_circ
        Bezier And Other Parametric Shaping Functions:
            www.flong.com/archive/texts/code/shapers_bez

*/


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define PI 3.14159265359

float plot(vec2 st)
{
    return smoothstep(0.02, 0.0, abs(st.y - st.x));
}


float plot_exp(vec2 st, float pct)
{
    return smoothstep(pct - 0.02, pct, st.y) - smoothstep(pct, pct + 0.02, st.y);
}

/**
    Date: Wed-11-12-2024, Keele Days

    Circular & Elliptical Shaping Functions

    *   Circular Interpolation: Ease-In and Ease-Out
    *   Double-Circle Seat
    *   Double-Circle Sigmoid
    *   Double-Elliptic Seat
    *   Double-Elliptic Sigmoid
    *   Double-Linear with Circular Fillet
    *   Circular Arc Through a Given Point
*/

/**
    Circular Interpolation: Ease-In and Ease-Out

    A circular arc provides a simple method for easing in or out of a unit square.
    The computational efficiency of the function is dimished by the use of the square root, though.

    Ease-In Interpolation:
        y = 1 - sqrt(1 - x^2)
    Ease-Out Interpolation:
        y = sqrt(1- (1-x)^2)
*/

float circular_ease_in(float x)
{
    float y = 1 - sqrt( 1- x * x);
    return y;
}

float circular_ease_out(float x)
{
    float y = sqrt(1 - (1-x)*(1-x));
    return y;
}

void draw_circular_ease_in()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    
    float y = circular_ease_in(st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1.0, 1.0, 0.15);

    gl_FragColor = vec4(color, 1.0);
}

void draw_circular_ease_out()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    
    float y = circular_ease_out(st.x);
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 1, 0.15);

    gl_FragColor = vec4(color, 1.0);

}

/**
    Double-Circle Seat

    This shaping function is formed by the meeting of two circular arcs
    which join with a horizontal tangent.
    The parameter a, range [0...1], governs the location of the curve's inflexion point
    along the diagonal of the unit square.

    Formulas:
        x <= a :    y = sqrt(a^2 - (x - a)^2)
        x > a  :    y = 1 - sqrt((1-a)^2 - (x - a)^2)
    
*/

float double_circle_seat(float x, float a)
{
    float min_param_a = 0.0;
    float max_param_a = 1.0;
    a = max(min_param_a, min(max_param_a, a));

    float y = 0;
    if (x<=a){
        float k = (x-a) * (x-a);
        y = sqrt(a * a - k);
    }else{
        float k1 = (1-a) * (1-a);
        float k2 = (x-a) * (x-a);
        y = 1.0 - sqrt(k1 - k2);
    }
    return y;
}

void draw_double_circle_seat()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 2.0;
    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    // vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, -(gl_FragCoord.y / u_mouse.y));

    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    
    float y = double_circle_seat((st.x * 1.15) - 0.5, norm_mouse.x) * 1.5;

    vec3 color = vec3(y);

    float pct = plot_exp(st * 2.15 - 0.5, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);

}

/**
    Double-Circle Sigmoid

    It's formed by the joining od two circular arcs at a vertical tangent.
    The parameter, a in the range [0...1], governs the location of the curve's inflection point
    along the diagonal of the unit square.

    x <= a :     y = a - sqrt(a^2 - x^2)
    x > a  :    y = a + sqrt((1-a)^2 - (x - 1)^2)
*/

float double_circle_sigmoid(float x, float a)
{
    float min_param_a = 0.0;
    float max_param_a = 1.0;
    a = max(min_param_a, min(max_param_a, a));
    
    float y = 0;
    
    if (x <= a){
        y = a - sqrt(a*a - x*x);
    }else{
        // y = a + sqrt((1-a)*(1-a) - (x-1)*(x-1));
        y = a + sqrt(pow(1-a, 2) - pow(x-1, 2));
    }
    return y;
}

void draw_double_circle_sigmoid()
{
    // vec2 st = gl_FragCoord.xy / u_resolution - 0.5;
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 2;

    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse;
    // vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, -(gl_FragCoord.y / u_mouse.y));

    //  Correct Normalization of Mouse Coordinates
    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    
    float y = double_circle_sigmoid(st.x, norm_mouse.x * 0.4) * 0.85;

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Double-Elliptic Seat

    This seat-shaped function is created by joining two elliptical arcs,
    and is a generalization of the Double-Circle Seat.
    The two arcs meet at the coordinate (a, b) with a horizontal
    tangent.

    Formula:
        x <= a  : y = (b/a) * sqrt(a^2 - (x-a)^2)
        x > a   : y = 1 - ((1-b)/(1-a)) * sqrt((1-a)^2 - (x-a)^2) 
*/

//  You'll notice the horizontal tangent
float double_elliptic_seat(float x, float a, float b)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;

    a = max(min_param_a, min(max_param_a, a));
    b = max(min_param_b, min(max_param_b, b));

    float y = 0;
    if (x <= a){
        y = (b/a) * sqrt(a*a - (x-a)*(x-a));
    }
    else{
        y = 1 - (((1-b)/(1-a)) * (sqrt((1-a)*(1-a) - (x-a)*(x-a))));
    }
    return y;
}

void draw_double_elliptic_seat()
{
    vec2 st = gl_FragCoord.xy / u_resolution; //-0.5;

    // st *= 2;

    // vec2 norm_mouse = gl_FragCoord.xy / u_mouse - 0.5;

    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    float y = double_elliptic_seat(st.x, norm_mouse.x, norm_mouse.y);

    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);

    // gl_FragColor = vec4(norm_mouse.y, 0.0, norm_mouse.x, 1.0);
    
}

/**
    Double-Elliptic Sigmoid

    It's created by joining two elliptical arcs.
    It is also generalization, one of Doubl-Circle Sigmoid.
    The arcs meet at the coordinate (a, b) in the unit square with a vertical
    tangent.

    Formulas:
        x <= a :    y = b * (1 - A / a)
                    A = sqrt(a^2 - x^2)
        x > a :     y = b + ((1-b)/(1-a)) * sqrt((1-a)^2 - (x-1)^2)

*/

float double_elliptic_sigmoid(float x, float a, float b)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0;
    float max_param_b = 1.0;
    a = max(min_param_a, min(max_param_a, a));
    b = max(min_param_b, min(max_param_b, b));

    float y = 0;
    if (x <= a)
    {
        y = b * (1 - (sqrt(a*a - (x*x)/a)));
    }else{
        y = b + ((1-b)/(1-a)) * sqrt(pow(1-a, 2) - pow(x-1, 2));
    }
    return y;
}

void draw_double_elliptic_sigmoid()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 2;


    // Correct Way.
    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    float y = double_elliptic_sigmoid(st.x, norm_mouse.x, norm_mouse.y);
    // float y = 1- double_elliptic_sigmoid(-st.x, norm_mouse.x, norm_mouse.y);
    // float y = 1 - double_elliptic_sigmoid(st.x, norm_mouse.x, norm_mouse.y);
    // float y = 1- double_elliptic_sigmoid(-st.x, norm_mouse.x, norm_mouse.y);
    
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Double-Linear with Circular Fillet

    This pattern joins two straight lines with a circular arc whose
    radius is adjustable.
    The user specifies the fillet's radius (with parameter c) and the
    coordinate in the unit square where the lines would otherwise intersect
    (with parameters a and b).
    This pattern is adapted from...
        Robert D. Miller's "Joining Two Lines with a Circular Arc Fillet",
        which appears in Graphics Gems.
*/

float arcStartAngle;
float arcEndAngle;
float arcStartX, arcStartY;
float arcEndX, arcEndY;
float arcCenterX, arcCenterY;
float arcRadius;


//  ---------------------------------------------
//  Return signed distance from line Ax + By + C = 0 to point P.
float linetopoint (float a, float b, float c, float ptx, float pty)
{
    float lp = 0.0;
    float d = sqrt((a*a)+(b*b));
    if (d != 0.0){
        lp = (a*ptx + b*pty + c) / d;
    }
    return lp;
}

//  -----------------------------------------------
//  Compute the parameters of a circular arc
//  Fillet between lines L1 (p1 to p2) and
//  L2 (p3 to p4) with radius R.
void computeFilletParameters(
    float p1x, float p1y,
    float p2x, float p2y,
    float p3x, float p3y,
    float p4x, float p4y,
    float r)
{
    float c1 = p2x * p1y - p1x * p2y;
    float a1 = p2y - p1y;
    float b1 = p1x - p2x;
    float c2 = p4x * p3y - p3x * p4y;
    float a2 = p4y - p3y;
    float b2 = p3x - p4x;

    if ((a1 * b2) == (a2*b1)){
        //  Parallel or Coincident Lines
        return;
    }

    float d1, d2;
    float mPx, mPy;
    mPx = (p3x + p4x) / 2.0;
    mPy = (p3y + p4y) / 2.0;
    d1 = linetopoint(a1, b1, c1, mPx, mPy); //  Find distance p1p2 to p3
    if (d1 == 0.0){return;}

    mPx = (p1x + p2x) / 2.0;
    mPy = (p1y + p2y) / 2.0;
    d2 = linetopoint(a2, b2, c2, mPx, mPy); //  Find distance p3p4 to p2
    if (d2 == 0.0){return;}

    float c1p, c2p, d;
    float rr = r;
    if (d1 <= 0.0){
        rr = -rr;
    }

    c1p = c1 - rr*sqrt((a1*a1)+(b1*b1));    //  Line parallel l1 at d
    rr = r;
    if (d2 <= 0.0) {rr=-rr;}

    c2p = c2 - rr*sqrt((a2*a2)+(b2*b2));    //  Line parallel l2 at d
    d = (a1 * b2) - (a2 * b1);

    float pCx = (c2p * b1 - c1p * b2)/d;       //  Intersect Constructed Lines
    float pCy = (c1p * a2 - c2p * a1)/d;       //  to find center of arc
    float pAx = 0;
    float pAy = 0;
    float pBx = 0;
    float pBy = 0;
    float dP, cP;

    dP = (a1*a1) + (b1*b1); //  Clip or Extend lines as required
    if (dP != 0.0){
        cP = a1 * pCy - b1 * pCx;
        pAx = (-a1*c1 - b1*cP) / dP;
        pAy = (a1 * cP - b1*c1)/ dP;
    }
    dP = (a2*a2) + (b2*b2);
    if (dP != 0.0){
        cP = a2 * pCy - b2 * pCx;
        pBx = (-a2*c2 - b2*cP) / dP;
        pBy = (a2*cP - b2*c2) / dP;
    }

    float gv1x = pAx - pCx;
    float gv1y = pAy - pCy;
    float gv2x = pBx - pCx;
    float gv2y = pBy - pCy;

    float arcStart = atan(gv1y, gv1x);
    float arcAngle = 0.0;
    float dd = sqrt(((gv1x*gv1x) + (gv1y*gv1y)) * ((gv2x * gv2x) + (gv2y * gv2y)));
    if (dd != 0.0){
        arcAngle = (acos((gv1x*gv2x + gv1y*gv2y)/dd));
    }
    float crossProduct = (gv1x * gv2y - gv2x * gv1y);
    if (crossProduct<0.0){
        arcStart -= arcAngle;
    }

    float arc1 = arcStart;
    float arc2 = arcStart + arcAngle;
    if (crossProduct < 0.0){
        arc1 = arcStart + arcAngle;
        arc2 = arcStart;
    }

    arcCenterX = pCx;
    arcCenterY = pCy;
    arcStartAngle = arc1;
    arcEndAngle = arc2;
    arcRadius = r;
    arcStartX = arcCenterX + arcRadius* cos(arcStartAngle);
    arcStartY = arcCenterY + arcRadius * sin(arcStartAngle);
    arcEndX = arcCenterX + arcRadius * cos(arcEndAngle);
    arcEndY = arcCenterY + arcRadius * sin(arcEndAngle);
}

//  ---------------------------------------------------------------------------
float circularFillet(float x, float a, float b, float R)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0 + epsilon;
    float max_param_b = 1.0 - epsilon;

    a = max(min_param_a, min(max_param_a, a));
    b = max(min_param_b, min(max_param_b, b));

    computeFilletParameters(0.0, 0.0, a, b, a, b, 1.0, 1.0, R);
    float t = 0;
    float y = 0;
    x = max(0, min(1, x));

    if (x <= arcStartX)
    {
        t = x / arcStartX;
        y = t * arcStartY;
    }else if (x >= arcEndX)
    {
        t = (x - arcEndX) / (1 - arcEndX);
        y = arcEndY + t * (1 - arcEndY);
    } else
    {
        if (x >= arcCenterX){
            y = arcCenterY - sqrt((arcRadius*arcRadius) - (x-arcCenterX) * (x-arcCenterX));
        }else{
            y = arcCenterY + sqrt((arcRadius * arcRadius) - (x-arcCenterX) * (x - arcCenterX));
        }
    }
    return y;
}


void draw_double_linear_circular_fillet()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    // st *= 2;

    // Correct Way.
    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    float y = circularFillet(st.x, norm_mouse.x, norm_mouse.y, 0.3);
     
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);
}

/**
    Circular Arc Through a Given Point

    This function defines a circular arc which passes through a user-specified
    point in the unit square.
    Unfortunately, not every location int he unit square lends itself to define a circle
    which also is confined to the unit square; the user-given point must inhabit
    a zone close to the main (identity) diagonal.

    This pattern is adapted from Paul Bourke's Equation of a Circle From 3 Points
*/

//  ---------------------------------------------------------------------
float m_Centerx;
float m_Centery;
float m_dRadius;

//  -----------------------------
bool IsPerpendicular(
    float pt1x, float pt1y,
    float pt2x, float pt2y,
    float pt3x, float pt3y
){
    //  Check the given point are perpendicular to x or y axis
    float yDelta_a = pt2y - pt1y;
    float xDelta_a = pt2x - pt1x;
    float yDelta_b = pt3y - pt2y;
    float xDelta_b = pt3y - pt2x;
    float epsilon = 0.000001;

    //  Check whether the line of the two pts are vertical
    if (abs(xDelta_a) <= epsilon && abs(yDelta_b) <= epsilon)
    {
        return false;
    }
    if (abs(yDelta_a) <= epsilon){return true;}
    else if (abs(yDelta_b) <= epsilon) {return true;}
    else if (abs(xDelta_a) <= epsilon) {return true;}
    else if (abs(xDelta_b) <= epsilon) {return true;}
    else return false;
}


void calcCircularFrom3Points(
    float pt1x, float pt1y,
    float pt2x, float pt2y,
    float pt3x, float pt3y
){
    float yDelta_a = pt2y - pt1y;
    float xDelta_a = pt2x - pt1x;
    float yDelta_b = pt3y - pt2y;
    float xDelta_b = pt3x - pt2x;
    float epsilon = 0.000001;

    if (abs(xDelta_a) <= epsilon && abs(yDelta_b) <= epsilon)
    {
        m_Centerx = 0.5 * (pt2x + pt3x);
        m_Centery = 0.5 * (pt1y + pt2y);
        m_dRadius = sqrt(pow(m_Centerx-pt1x, 2) + pow(m_Centery, 2));
        return;
    }

    //  IsPerpendicular() assure that xDelta(s) are not zero
    float aSlope = yDelta_a / xDelta_a;
    float bSlope = yDelta_b / xDelta_b;
    if (abs(aSlope-bSlope) <= epsilon){
        //  Checking Whether the Given Points are Colinear
        return;
    }

    //  Calc Center
    m_Centerx = (
        aSlope * bSlope * (pt1y - pt3y) +
        bSlope * (pt1x + pt2x) -
        aSlope * (pt2x + pt3x)) / (2 * (bSlope-aSlope));
    m_Centery = -1 * (m_Centerx - (pt1x + pt2x) / 2) / aSlope + (pt1y + pt2y) / 2;
    m_dRadius = sqrt(pow(m_Centerx - pt1x, 2) + pow(m_Centery - pt1y, 2));
}


float circularArcThroughAPoint(float x, float a, float b)
{
    float epsilon = 0.00001;
    float min_param_a = 0.0 + epsilon;
    float max_param_a = 1.0 - epsilon;
    float min_param_b = 0.0 + epsilon;
    float max_param_b = 1.0 - epsilon;

    a = min(max_param_a, max(min_param_a, a));
    b = min(max_param_b, max(min_param_b, b));

    x = min(1.0 - epsilon, max(0.0 + epsilon, x));

    float pt1x = 0;
    float pt1y = 0;
    float pt2x = a;
    float pt2y = b;
    float pt3x = 1;
    float pt3y = 1;

    if (!IsPerpendicular(pt1x, pt1y, pt2x, pt2y, pt3x, pt3y))
        calcCircularFrom3Points(pt1x, pt1y, pt2x, pt2y, pt3x, pt3y);
    else if (!IsPerpendicular(pt1x, pt1y, pt3x, pt3y, pt2x, pt2y))
        calcCircularFrom3Points(pt1x, pt1y, pt3x, pt3y, pt2x, pt2y);
    else if (!IsPerpendicular(pt2x, pt2y, pt1x, pt1y, pt3x, pt3y))
        calcCircularFrom3Points(pt2x, pt2y, pt1x, pt1y, pt3x, pt3y);    
    else if (!IsPerpendicular(pt2x, pt2y, pt3x, pt3y, pt1x, pt1y))
        calcCircularFrom3Points(pt2x, pt2y, pt3x, pt3y, pt1x, pt1y);    
    else if (!IsPerpendicular(pt3x, pt3y,pt2x, pt2y, pt1x, pt1y))
        calcCircularFrom3Points(pt3x, pt3y, pt2x, pt2y, pt1x, pt1y);
    else if (!IsPerpendicular(pt3x, pt3y, pt1x, pt1y, pt2x, pt2y))
        calcCircularFrom3Points(pt3x, pt3y, pt1x, pt1y, pt2x, pt2y);
    else{
        return 0;
    }

    //  Constrain
    if ((m_Centerx > 0) && (m_Centerx < 1)){
        if (a < m_Centerx){
            m_Centerx = 1;
            m_Centery = 0;
            m_dRadius = 1;
        }else{
            m_Centerx = 0;
            m_Centery = 1;
            m_dRadius = 1;
        }
    }

    float y = 0;
    if (x >= m_Centery){
        y = m_Centery - sqrt(m_dRadius*m_dRadius - pow(x-m_Centerx, 2));
    }else{
        y = m_Centery + sqrt(m_dRadius*m_dRadius - pow(x-m_Centerx, 2));
    }
    return y;
}



void draw_circular_arc_through_a_point()
{
    vec2 st = gl_FragCoord.xy / u_resolution;
    st *= 1.5;

    // Correct Way.
    float mouse_y = abs(u_resolution.y - u_mouse.y);
    vec2 norm_mouse = vec2(gl_FragCoord.x / u_mouse.x, gl_FragCoord.y / mouse_y);

    float y = -0.5 + circularArcThroughAPoint(st.x, norm_mouse.x, norm_mouse.y);
  
    vec3 color = vec3(y);

    float pct = plot_exp(st, y);
    color = (1.0 - pct) * color + pct * vec3(1, 0.15, 0.85);

    gl_FragColor = vec4(color, 1.0);
}


void main()
{
    // draw_circular_ease_in();
    // draw_circular_ease_out();
    // draw_double_circle_seat();
    // draw_double_circle_sigmoid();
    // draw_double_elliptic_seat();
    // draw_double_elliptic_sigmoid();
    // draw_double_linear_circular_fillet();
    draw_circular_arc_through_a_point();
}