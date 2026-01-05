"""
    The Designer chooses which Scene to render.
    With this, I could implement more functionality, for example
    a way to choose different Scenes to display as the project grows.

    The Designer brings together the text and the art effects!
    It has access to the shaders, to beautify it
"""


from . import pg
from . import sys
from . import mgl
from . import np
from . import TYPE_CHECKING


from .Canvas import Canvas

if TYPE_CHECKING:   #   Because I only need the type hint to work.
    from .Engine import Engine

from core.scripts_core.ArtGenerator import *
from core.scripts_core.CaligraphyGenerator import *


class ShaderEngine():
    def __init__(self, designerControl):
        self.desinger_ref = designerControl
        self.ctx = mgl.create_context()
        self.shader_program = self.create_shader_program()
        self.surface_vertices = [
            (-1, -1), (1, -1), (1, 1), (-1, 1)
        ]
        self.surface_indices = [
            ##  For the triangles, the order of rendering the vertices 
            (0, 1, 2), (0, 2, 3)
        ]
        self.vbo = self.get_vbo()
        self.vao = self.get_vao()
        self.set_uniform('u_resolution', self.app_ref.RES)
        self.shader_program["textureSampler"] = 0
    
    def surf_to_texture(self, surface):
        """
            Turns the pygame surface and returns an opengl texture
        """
        ##  The 4 is the number of components: RGBA
        texture = self.ctx.texture(surface.get_size(), 4)
        ##  Affects the minification and magnification filter for the texture
        texture.filter = (mgl.NEAREST, mgl.NEARREST)
        texture.swizzle = "BGRA"
        texture.write(surface.get_vieew("1"))
        return texture
    
    def render(self):
        self.update_time()
        self.ctx.clear()
        self.vao.render()
    
    def update_time(self):
        self.set_uniform('u_time', pg.time.get_ticks() * 0.001)

    def set_uniform(self, uniformName, uniformValue):
        try:
            self.shader_program[uniformName] = uniformValue
        except KeyError:
            pass
    
    def destroy(self):
        self.vbo.release()
        self.shader_program.release()
        self.vao.release()
    
    def load_shader(self, filePath):
        with open(filePath) as f:
            return f.read()
    
    def create_shader_program(self):
        ##  The Shader Program
        program = self.ctx.program(
            vertex_shader=self.load_shader("source/shader_core/shaders/custom_shader.vert"),
            fragment_shader=self.load_shader("source/shader_core/shaders/custom_shader.frag")
        )
        return program

    def order_data(self, vertices, indices):
        data = [vertices[index] for triangle in indices for index in triangle]
        return np.array(data, dtype="f4")

    def get_vbo(self):
        vertices_data = self.order_data(self.surface_vertices, self.surface_indices)
        vbo = self.ctx.buffer(vertices_data)
        return vbo

    def get_vao(self):
        vao = self.ctx.vertex_array(self.shader_program, [(self.vbo, '2f',
                                                           *['vertexPosition'])])
        return vao
    

class Designer:
    def __init__(self, engineRef: 'Engine'):
        # self.window = pg.display.set_mode(self.RES, pg.OPENGL | pg.DOUBLEBUF)
        # self.clock = pg.time.Clock()

        self.engine_ref = engineRef
        self.canvas_ref = Canvas(self)


        # self.shader_engine = ShaderEngine(self)

        # self.caligraphy1 = Caligraphy("The Alpha-Omega",
        #                               (self.WIDTH//2, self.HEIGHT//2), (255, 63, 32), font_size = 50)
        # self.sky_lights = SkyLights(self)
        # self.light_cores = TheLights(self, 50)
        # self.heavenly_lights = HeavenlyLights(self)
        # self.spinning_lights = SpinningLights(self)

    def release_memory(self):
        self.canvas_ref.release_memory()
    
    ##  This controls the order of rendering of various items
    def render(self):
        # self.window.fill("black")
        # self.sky_lights.generate_lights()
        # self.window.blit(self.caligraphy1.get_surface(),
        #                   (self.caligraphy1.x-self.caligraphy1.text_width//2, 
        #                    self.caligraphy1.y-self.caligraphy1.text_height//2))
        # self.light_cores.make_light()
        # self.heavenly_lights.generate_lights()
        # self.spinning_lights.generate_lights()
        self.canvas_ref.render()