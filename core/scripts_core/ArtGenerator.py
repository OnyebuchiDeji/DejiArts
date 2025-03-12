import pygame as pg
import random as rnd
import math
# from Designer import Designer
"""
    This part of the app uses procedural generation to make stunning art!
"""


def hash12(time, area_resolution):
    # x = rnd.random() * math.sin(time * 3453.329) * area_resolution[0]
    # y = rnd.random() * math.sin((time + x) * 8532.732) * area_resolution[1]
    x = rnd.random() *  area_resolution[0]
    y = rnd.random() * area_resolution[1]

    return (x, y)

def randomVector(min, max) -> pg.Vector2:
    return pg.Vector2(rnd.uniform(min, max), rnd.uniform(min, max))

class Circle:
    def __init__(self, pos:tuple[float, float], radius:float, color:tuple[int, int, int]=(255, 255, 255), fill:bool=True):
        self.x, self.y = pos
        self.radius = radius
        self.color = color
        self.fill_flag = fill
        self.circle_surface = self.draw_circle(255)

    
    def toggle_fill(self)->None:
        self.fill_flag = not self.fill_flag


    def draw_circle(self, intensity):
        """This Makes the circle and the surface"""
        circleSurf = pg.Surface((self.radius*2, self.radius*2))
        ##  To fill for debugging
        # circleSurf.fill(pg.Color("gray"))
        ##  True evaluates to 1, False to 0. Fill is when it is 0, so not True
        pg.draw.circle(circleSurf, self.color, (self.radius, self.radius), self.radius, not self.fill_flag)
        ##  This makes any pixel in the surface that is colored black, transparent
        circleSurf.set_colorkey((0, 0, 0))
        circleSurf.set_alpha(intensity)
        return circleSurf

class CirclePlain:
    def __init__(self, surface, pos:tuple[float, float], radius:float, color:tuple[int, int, int]=(255, 255, 255), fill:bool=True):
        self.surface = surface
        self.x, self.y = pos
        self.radius = radius
        self.color = color
        self.fill_flag = fill
        # self.circle_surface = self.draw_circle_plain()

    def draw_circle_plain(self):
        return pg.draw.circle(self.surface, self.color, (self.x, self.y), self.radius, not self.fill_flag)




class Light_v2(Circle):
    def __init__(self, pos: tuple[float, float], radius: float, color:tuple=(255, 255, 255), fill=True):
        super().__init__(pos, radius, color, fill)
        self.intensity = 255
        self.sign = -1
    
    def draw_light(self, opacity_rate=1.0):
        self.intensity += opacity_rate * self.sign
        if self.intensity < 125:
            self.sign = 1
        if self.intensity == 225:
            self.sign = -1
        self.circle_surface = self.draw_circle(self.intensity)
        return self.circle_surface
        

class TheLights:
    def __init__(self, designer : 'Designer', numOfLights):
        self.designer_ref = designer
        self.num_of_lights = numOfLights
        self.lights = []
    
    def make_light(self):
        light = Circle((50, 50), 50, (196, 120, 209), True)
        light.circle_surface.set_alpha(255)
        self.designer_ref.window.blit(light.circle_surface, (light.x - light.radius, light.y-light.radius))
        # self.designer_ref.window.blit(light.draw_circle(), (light.x, light.y))
        # pg.draw.circle(self.designer_ref.window, (255, 255, 255), (50, 50), 10)

    def generate_lights(self):
        if len(self.lights) == 0:
            time = pg.time.get_ticks() * 1e-03
            self.lights = [Light_v2(hash12(time, (self.designer_ref.WIDTH, self.designer_ref.HEIGHT)), rnd.randrange(50, 80),
                            (rnd.randrange(192, 255), rnd.randrange(32, 64), rnd.randrange(64, 128)))
                            for i in range(self.num_of_lights)]

        for light in self.lights:
            self.designer_ref.window.blit(light.draw_light(), (light.x-light.radius, light.y-light.radius))
            light.radius -= 0.25

            if light.radius <= 0:
                self.lights.remove(light)


class Mover():
    def __init__(self, designer_ref, pos: tuple[float, float], mass: float):
        self.designer_ref = designer_ref
        ##  It's given a random direction of motion
        self.position = pg.Vector2(pos)
        ##  Giving mover initial random velocity
        self.velocity = randomVector(-5, 5)
        self.acceleration = pg.Vector2(0, 0)
        self.mass = mass
        ##  self.radius is the radius of the bodies
        self.radius = math.sqrt(self.mass) * 2
        self.body = Light_v2((self.position), self.radius)
        # self.body

    def apply_force(self, force: pg.Vector2):
        self.acceleration += force / self.mass
        print(self.acceleration)
        # self.acceleration.clamp_magnitude_ip(1, 5)
    
    def update(self):
        self.velocity += self.acceleration
        self.velocity.clamp_magnitude_ip(1, 5)
        self.position += self.velocity

    def create(self):
        self.body.x, self.body.y = self.position
        self.designer_ref.window.blit(self.body.draw_light(), (self.body.x-self.body.radius, self.body.y-self.body.radius))

    def create_v2(self):
        CirclePlain(self.designer_ref.window, self.position, self.radius).draw_circle_plain()
        
class Attractor():
    def __init__(self, designer_ref, pos: tuple[float, float], mass: float):
        self.designer_ref = designer_ref
        self.position= pg.Vector2(pos)
        self.mass = mass
        ##  self.radius is the radius of the bodies
        self.radius = math.sqrt(self.mass) * 2
        self.G = 1
        self.body = Light_v2((self.position), self.radius)
        self.body.color = (209, 64, 196)

    
    def attract(self, mover: Mover):
        """
            The force that attracts the mover
            The distance R will be constrained so that the force gotten does not cause something like divide by zero...
            or a very small value that could make the strength so small, that it catapults the object away
        """
        ##  Vector that points from mover to attractor
        forceVector = pg.Vector2(self.position-mover.position)
        ## This clamps the magnitude in place, between 25 and 50, so that the R..
        ##  will always be between 25 squared and 50 squared
        forceVector.clamp_magnitude_ip(100, 100)
        #3  Get the distance or length of the vector, gives the distance between attractor and mover
        R = forceVector.magnitude_squared()
        ##  Get the gravitational attraction force
        forceMagnitude = self.G * (self.mass * mover.mass) / R
        ##  Scales the vector to the given force to now represent the strength of the force
        forceVector.scale_to_length(forceMagnitude)
        mover.apply_force(forceVector)

    def create(self):
        self.designer_ref.window.blit(self.body.draw_light(), (self.body.x-self.body.radius, self.body.y-self.body.radius))
    
    def create_v2(self):
        CirclePlain(self.designer_ref.window, self.position, self.radius).draw_circle_plain()
        

    

class HeavenlyLights:
    """
        THese use the fluctuating circles
    """
    def __init__(self, designer : 'Designer'):
        self.designer_ref = designer
        self.alpha_surface = pg.Surface(self.designer_ref.RES)
        self.alpha_surface.set_alpha(5)
        # self.num_of_lights = numOfLights
        self.attractor = Attractor(designer, (600, 335), 100)
        # self.mover = Mover(designer, 300, 150, 50)
        self.movers = [Mover(designer, pg.Vector2(rnd.uniform(0, self.designer_ref.HEIGHT),
                                                   rnd.uniform(0, self.designer_ref.HEIGHT)), rnd.uniform(50, 70)) for i in range(10)]
    
    def generate_lights(self):
        self.designer_ref.window.blit(self.alpha_surface, (0, 0))
        for mover in self.movers:
            mover.update()
            mover.create()
            self.attractor.attract(mover)
        self.attractor.create()

class SpinningLights:
    """
        Spinning lights -- these use normal circles that don't wax and wane in brightness
    """
    def __init__(self, designer : 'Designer'):
        self.designer_ref = designer
        self.alpha_surface = pg.Surface(self.designer_ref.RES)
        self.alpha_surface.set_alpha(5)
        # self.num_of_lights = numOfLights
        self.attractor = Attractor(designer, 600, 335, 100)
        self.mover = Mover(designer, 300, 150, 50)
    
    def generate_lights(self):
        self.designer_ref.window.blit(self.alpha_surface, (0, 0))
        self.mover.update()
        self.mover.create_v2()
        self.attractor.attract(self.mover)
        self.attractor.create_v2()

        
    
class Light:
    def __init__(self, circle: Circle, intensity=3):
        self.core = circle
        self.intensity = intensity

    def determine_order(self):
        order = 0
        intensity = self.intensity
        while intensity > 1:
            intensity //= 10
            order += 1
        return order

        

    def create_light(self)->pg.Surface:

        ##  This surface is big enough to contain the largest glow circle
        penumbra_surface = pg.Surface((2*self.core.radius * (1 + self.intensity/10), 2*self.core.radius * (1+ self.intensity/10)))
        penumbra_surf = penumbra_surface.get_rect()
        penumbra_surface.fill((0, 27, 0))
        
        self.penumbra_width, self.penumbra_height = penumbra_surf.width, penumbra_surf.height

        for i in range(2*self.intensity):
            # This is so that the radius increases by half every iteration
            layer_radius = self.core.radius * (1 + (i * 0.5 * 0.1))
            # dColor = (pg.time.get_ticks() * 1e-3 * (i * 0.5))/255
            dColor = 1
            glow_layer = Circle((self.core.x, self.core.y), layer_radius,
                                (self.core.color[0]*dColor, self.core.color[1]*dColor, self.core.color[2]*dColor))
            
            penumbra_surface.blit(glow_layer.draw_circle(), (self.penumbra_width//2-layer_radius, self.penumbra_height//2-layer_radius), 
                                    special_flags=pg.BLEND_RGB_ADD)

        # penumbra_surface.set_colorkey((0, 0, 0))

        return penumbra_surface

class SkyLights():
    def __init__(self, designer_handle:pg.Surface):
        self.designer = designer_handle
        self.lights = []


    def hash12(self, t, area_resolution):

        # x = rnd.random() * math.sin(t * 3453.329) * area_resolution[0]
        # y = rnd.random() * math.sin((t + x) * 8532.732) * area_resolution[1]
        x = rnd.random() *  area_resolution[0]
        y = rnd.random() * area_resolution[1]

        return (x, y)
            
    def generate_light(self) -> None:
        self.light = Light(Circle((self.designer.WIDTH//2, self.designer.HEIGHT//2), 50, (205, 48, 96)), intensity=20)
        self.designer.window.blit(self.light.create_light(), (self.light.core.x-self.light.penumbra_width//2,
                                                                self.light.core.y-self.light.penumbra_height//2))

    def generate_light_v1(self) -> None:
        circle= Circle((self.designer.WIDTH//2, self.designer.HEIGHT//2), 50)
        glow_radius = circle.radius * (1.5)
        glow_circle = Circle((circle.x, circle.y), glow_radius, (20, 20, 20)).draw_circle()

        self.designer.window.blit(circle.draw_circle(), (circle.x-circle.radius, circle.y-circle.radius),
                                   special_flags=pg.BLEND_RGB_ADD)
        # glow_circle.blit(circle.draw_circle(), (circle.x-circle.radius, circle.y-circle.radius))
        self.designer.window.blit(glow_circle, (circle.x-glow_radius, circle.y-glow_radius),
                                   special_flags=pg.BLEND_RGB_ADD)

        # self.designer.window.blit(glow_circle, (circle.x-glow_radius, circle.y-glow_radius),
        #                            special_flags=pg.BLEND_RGB_ADD)

    def generate_lights(self)->None:
        # x, y = self.designer.WIDTH//3, self.designer.HEIGHT//3
        # circle = Circle((x, y), 50)
        # ##  Again, when blitting a surface, the top left corner acts as the origin...
        # ##  So, if I blit at (0, 0) on the main window, the circle surface will be at top left corner
        # ##  But I want it to be centered at the coordinate I specify. That is why I subtract the radius...
        # #3  which is half of the width and height of the surface
        # self.designer.window.blit(circle.draw_circle(), (circle.x-circle.radius, circle.y-circle.radius))

                           
        if len(self.lights) == 0:
            time = pg.time.get_ticks() * 1e-03
            self.lights = [Light(Circle(self.hash12(time, (self.designer.WIDTH, self.designer.HEIGHT)), rnd.randrange(50, 80),
                            (rnd.randrange(192, 255), rnd.randrange(32, 64), rnd.randrange(64, 128))), intensity=3)
                            for i in range(5)]
        
        for light in self.lights:
            self.designer.window.blit(light.create_light(), (light.core.x-light.penumbra_width//2,
                                                              light.core.y-light.penumbra_height//2),
                                                              special_flags=pg.BLEND_RGB_ADD)
            ##  Adding Glow Circle
            # glow_radius = light.radius * 2
            # self.designer.window.blit(Circle((light.x, light.y), glow_radius,
            #                                 (light.color[0]*0.25, light.color[1]*0.5, light.color[2]*0.85)).draw_circle(),
            #                                 (light.x-glow_radius, light.y-glow_radius), special_flags=pg.BLEND_RGB_ADD)
            light.core.radius -= 0.1

            if light.core.radius <= 0:
                self.lights.remove(light)









