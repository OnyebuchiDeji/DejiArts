

/**
    Date: Thurs-12-12-2024

    Circular & Elliptical Shaping Functions

    Circular Arc Through a Given Point
    

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
    draw_circular_arc_through_a_point();
}