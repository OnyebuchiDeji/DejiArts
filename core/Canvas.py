"""
    This script contains the specifications
    for the Canvas and Layers.
    They are all pg.Surfaces that enable OpenGL.
    They provide the functions to read screen pixels and such. 
"""

from . import TYPE_CHECKING

from . import pg


from .Scene import Scene
from .scripts_core.shader_core.ShaderPrograms import ShaderProgramsManager
from .Texture import TextureManager
from .scripts_core.shader_core.VertexArray import VertexArrayObjectsManager



if TYPE_CHECKING:
    from .Designer import Designer

class Layers:
    ...

class Canvas:
    """
        A Canvas can only have one Scene
        A Scene is a collection of Scripts painting an image.
        A Scene can be Pygame rendered or Moderngl rendered.
        The Can
    """
    def __init__(self, designerRef: 'Designer'):
        self.designer_ref = designerRef
        self.ctx_ref = self.designer_ref.engine_ref.ctx
        self.dimensions = self.designer_ref.engine_ref.win_dimensions
        self.vao_manager = VertexArrayObjectsManager(self.ctx_ref)
        self.textures_manager = TextureManager(self.ctx_ref)

        self.surface = pg.Surface(self.dimensions)
        self.scene: Scene = Scene(self)
    
    def release_memory(self):
        self.vao_manager.destroy_all()
    
    def render(self):
        # self.ctx_ref.screen.use()
        self.ctx_ref.clear()
        self.scene.render()

        if self.designer_ref.engine_ref.GL_MODE:
            self.designer_ref.engine_ref.window.blit(self.surface, (0, 0))
        