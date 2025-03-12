from . import pg
from . import sys
from . import mgl
from .Designer import Designer



class Engine:
    def __init__(self, winDimensions=(1200, 675)):
        pg.init()
        self.win_dimensions = winDimensions
        pg.display.gl_set_attribute(pg.GL_CONTEXT_MAJOR_VERSION, 3)
        pg.display.gl_set_attribute(pg.GL_CONTEXT_MINOR_VERSION, 3)
        pg.display.gl_set_attribute(pg.GL_CONTEXT_PROFILE_MASK, pg.GL_CONTEXT_PROFILE_CORE)

        self.GL_MODE = True

        self.window = pg.display.set_mode(self.win_dimensions, flags=pg.OPENGL | pg.DOUBLEBUF) if self.GL_MODE else pg.display.set_mode(self.win_dimensions)

        self.ctx = mgl.create_context() if self.GL_MODE else None

        self.ctx.enable(flags= mgl.DEPTH_TEST | mgl.CULL_FACE | mgl.BLEND)
        
        #   Mouse Settings
        # pg.event.set_grab(True)
        # pg.mouse.set_visible(False)

        self.clock = pg.time.Clock()
        self.time = 0
        self.delta_time = 0
        self.mouse = pg.mouse

        # self.light = Light()
        # self.camera = Camera(self)
        # self.mesh = Mesh(self)
        # self.scene = Scene(self)
        self.fps = 60
        self.designer = Designer(self)



    def check_events(self):
        for e in pg.event.get():
            if e.type == pg.QUIT or (e.type==pg.KEYDOWN and e.key==pg.K_ESCAPE):
                self.designer.release_memory()
                pg.quit()
                sys.exit()


    def render(self):
        self.designer.render()
        pg.display.flip()
        self.clock.tick(60)

    def get_current_time(self):
        self.time = pg.time.get_ticks() * 0.001
    
    def get_mouse_pos(self) -> tuple:
        return pg.mouse.get_pos()
        
    def get_mouse_clicked_pos(self, mouseButton: str="left") -> tuple:
        if mouseButton == "left":
            if (pg.mouse.get_pressed()[0] == True):
                return self.get_mouse_pos()
            else:
                return (0, 0)
        else:   #   If Right.
            if (pg.mouse.get_pressed()[2] == True):
                return self.get_mouse_pos()
            else:
                return (0, 0)
            

    def run(self):
        while True:
            self.get_current_time()
            self.check_events()
            # self.camera.update()
            self.render()
            self.delta_time = self.clock.tick(self.fps)
            pg.display.set_caption(str(self.clock.get_fps()))