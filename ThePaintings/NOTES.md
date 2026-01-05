#   Date: Wednesday 16th April, 2025




#   Brief
Talks about `ThePaintings` project


#   Things Learnt
The glsl languages come in different versions.
I could use 330 core or 300 es.
In this project, I use 300 es. Backward compatibility is available, so yes.

Also both the fragment and vertex shaders must be the same version.


#   Discussions
+   There was an issue with saving images; it arose from the order in which the functions are called.
    -   The `run_render` function in the BasicShaderScript class was not being called before but after
        the get_click_event() method. Hence the context was not filled anytime I clicked `s` to save.
    -   I forgot that I was to prefix methods to control when they are called, e.g. `a_run_render` will
        ensure the render is called to fill the glContext before I call the save method.

+   For the `shader2.frag` that implemented:
    *       smoother noise (Perlin-style).
    *       Sobel edge detection for enhanced lines before blurring.
    *       Slight shimmer animation with u_time.
    After some time of running, the noise "**Eats**" the image from bottom up; leaving it colored black