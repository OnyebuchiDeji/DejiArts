


from core.Engine import Engine
from core.scripts_core.Scripts import Script
from core.entities_core.ShaderEntities import MglSurfaceEntity
import os

class BasicShaderScript(Script):
    def __init__(self, canvasRef=None):
        super().__init__(canvasRef)
        #   Specify where the shaders are

        #   By specifying jus tone attribute, no texture will be added.
        self.gl_surface = MglSurfaceEntity(
            self, "TheBookOfShaders", "TheBookOfShaders", "2f",
            ["vertexPosition"], False, False, False
        )

        self.canvas_ref.surface.fill("black")
        self.mouse_click1 = [0.0,0.0]
        self.mouse_click2 = [0.0,0.0]
        self.mouse_turn = 1
        self.engine_ref = self.canvas_ref.designer_ref.engine_ref
        self.mouse_ref = self.canvas_ref.designer_ref.engine_ref.mouse
        self.once = 0
        self.get_mouse_click()
    
        # self.print_count = 0

    def a_init_gl(self):
        self.gl_surface.set_uniform('u_resolution', self.canvas_ref.designer_ref.engine_ref.win_dimensions)
        self.gl_surface.set_uniform('u_mouse', self.canvas_ref.designer_ref.engine_ref.get_mouse_pos())
        self.gl_surface.set_uniform('u_mouse_click1', self.mouse_click1)
        self.gl_surface.set_uniform('u_mouse_click2', self.mouse_click2)
        self.gl_surface.set_uniform('u_time', float(self.canvas_ref.designer_ref.engine_ref.time))

        self.gl_surface.render()
        

        #3  SOME TESTS
        # if self.print_count % 100 == 0:
        #     print(self.mouse.get_pressed())
        # self.print_count += 1

    def get_mouse_click(self):
        """
            Because class Script runs every method defined in it...
            there is no need to call this on init; it calls itself
            Works such that each mouse click for the two points
            has its own turn -- binary

            self.once is to ensure the code in it runs once.
        """


        if self.mouse_ref.get_pressed()[0]:
            value = self.engine_ref.get_mouse_pos()
            self.mouse_turn = self.mouse_turn
            self.once = 0
        else:
            # pressed = False
            value = (0, 0)

            if self.once <= 0:
                self.mouse_turn = not self.mouse_turn
                self.once += 1

        if value[0] > 0 and value[1] > 0:
            if self.mouse_turn == 0 :
                self.mouse_click1 = value
                # print(f"Point 1 Clicked, Turn: {self.mouse_turn}")
                # print(f"Point: {value}")
            elif self.mouse_turn == 1:
                self.mouse_click2 = value
                # print(f"Point 2 Clicked, Turn: {self.mouse_turn}")
                # print(f"Point: {value}")
 

def setup():
    my_engine = Engine(winDimensions=(650, 650))
    #   Must initialize the script with a canvas
    file_path = os.path.dirname(__file__)
    my_engine.designer.canvas_ref.vao_manager.shader_programs.shader_scripts_dir = os.path.join(file_path)
    my_script = BasicShaderScript(my_engine.designer.canvas_ref)
    my_engine.designer.canvas_ref.scene.add_script("TheBookOfShaders", my_script)
    my_engine.run()


def main():
    setup()
