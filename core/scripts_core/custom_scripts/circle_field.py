from ..Scripts import Script
from ... import pg
from ...entities_core.ShaderEntities import MglSurfaceEntity

class CircleFieldScript(Script):
    def __init__(self, canvasRef=None):
        super().__init__(canvasRef)
        self.gl_surface = MglSurfaceEntity(
            self, "CircleField", "CircleField", False
        )
        self.canvas_ref.surface.fill('black')


    def a_init_gl(self):
        mouse_x, mouse_y = pg.mouse.get_pos()
        pg.draw.circle(self.canvas_ref.surface, (255, 0, 0), (mouse_x, mouse_y), 45)

        self.gl_surface.add_texture_from_pg_surface(
            "CircleField", self.canvas_ref.surface
        )

        self.gl_surface.set_uniform('uTime', float(self.canvas_ref.designer_ref.engine_ref.time))

        self.gl_surface.render()
        #   Note that the texture has to be removed before the next loop
        #   lest the textures keep piling up in memory.
        #   pree that adding them to a dictionary only adds a reference to them in that
        #   dictionary, and a weak one in that matter; that is, even though
        #   it is removed from the dictionary, that texture object still remains inmemory.
        #   hence it needs to be destroyed even during execution, since this 
        #   script updates the texture being displayed every iteration.
        self.gl_surface.remove_texture("CircleField")

    # def draw_circle(self):
        

    # def speak(self):
    #     print("Yo from CircleField!")