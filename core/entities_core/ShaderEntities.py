"""
    There are Shader Entities.
    Shader Entities are more peculiar; they define the vertices of the Basic entities
    to be passed to their scripts.
    These vertices are stored in a Vertex Buffer Object (VBO).
    The VBO along with Indices to order their creation, are used to create the VAO.
    The VAO or Vertex Array Object is the main object that sends all the input
    to the shaders connected to the program (a moderngl context program).

    Also, every program refers to its own vertex and fragment (and other) shaders.

    Entities are geometric models. Then, scripts can be used to add textures to them
    and such.
"""

from .. import np
from .. import pg
from ..scripts_core.shader_core.VertexBuffer import BaseVertexBufferObject
from ..scripts_core.Scripts import Script

# from .. import TYPE_CHECKING
# if TYPE_CHECKING:

class ShaderEntity(BaseVertexBufferObject):
    """
        This is the Base class for all Shader Entities
        Now an 
        The Base class consists of  these:
    """
    def __init__(self, scriptRef: Script, modelName: str, shadersProgramName: str, format:str, attributes: list[str], isDynamic=False):
        self.parent_script = scriptRef
        self.ctx_ref = scriptRef.canvas_ref.ctx_ref
        self.vao_manager_ref = scriptRef.canvas_ref.vao_manager
        self.vbo_manager_ref = self.vao_manager_ref.vbo_manager
        self.shaders_program_ref = scriptRef.canvas_ref.vao_manager.shader_programs
        # self.program = self.vao_manager_ref
        #   This creates the entity's vbo and adds it to the vbo manager.
        super().__init__(self.ctx_ref, modelName, self.vbo_manager_ref, format, attributes, isDynamic)
        #   Now the program also is created, and the vao_manager knows this.
        self.shaders_program_ref.add_program(shadersProgramName)
        #   Finally, the vao manager is created
        self.vao_manager_ref.add_vao(
            modelName, shadersProgramName
        )
        self.model_name = modelName
        self.shaders_name = shadersProgramName
        self.textureName = ""
        #   This is the vao program that refers to the shaders; with it I can
        #   make uniforms, and such
        self.entity_program = self.vao_manager_ref.vertex_array_objects[modelName].program

        self.texture_manager_ref = scriptRef.canvas_ref.textures_manager
        self.print_count = 0

    def set_uniform(self, uName, uValue):
        try:
            self.entity_program[uName] = uValue
        except KeyError as e:
            if self.print_count <= 0:
                print("Uniform Error: ", str(e))
            if (self.print_count <= 1):
                self.print_count += 1

    def order_vertex_data(self):...

    # def create_vbo(self):
    #     return super().create_vbo()

    def render(self):...
    
    def destroy(self):
        super().destroy() # Releases its mgl.Buffer (vbo) memory
        # self.texture_manager_ref.release(self.textureName)
        # self.vao_manager_ref.destroy(self.model_name, self.shaders_name)
        

"""
    Now, to start making actual Entity Models.
"""

class MglSurfaceEntity(ShaderEntity):
    def __init__(self, scriptRef: Script, modelName: str, shadersProgamName: str, v_format="", attributes:list[str] = [], externalTexture: bool = False, isDynamic=False, withTextures:bool=False):

        self.withTextures = withTextures

        self.surface_vertices = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
        #   Helps Moderngl know the order of how to reade
        #   the above vertices
        self.surface_indices = [(0,1,2), (0,2,3)]

        if (withTextures):
            self.texture_vertices = [(0, 1), (1, 1), (1, 0), (0, 0)]
            self.texture_indices = [(0,1,2), (0,2,3)]

        self.format = v_format if v_format else '2f 2f'
        self.attributes = attributes if attributes else ["vertexPosition", "texturePosition"]
        super().__init__(scriptRef, modelName, shadersProgamName, self.format, self.attributes, isDynamic=isDynamic)

        
    
    def add_texture(self, textureName: str, texturePath:str):
        self.textureName = textureName
        self.texture_manager_ref.add_texture(textureName, texturePath)
        self.image_texture = self.texture_manager_ref.textures[textureName]
        self.set_uniform("textureVar1", 0)
        self.image_texture.use(location=0)

    def add_texture_from_pg_surface(self, textureName: str, surface: pg.Surface):
        """This is for Pygame Surfaces turned Moderngl Textures """
        self.textureName = textureName
        self.texture_manager_ref.pg_surface_to_mg_texture(textureName, surface)
        self.image_texture = self.texture_manager_ref.textures[textureName]
        self.set_uniform("textureVar1", 0)
        self.image_texture.use(location=0)
    
    def remove_texture(self, textureName: str):
        self.texture_manager_ref.release(textureName)
    
    def render(self):
        self.vao_manager_ref.vertex_array_objects[self.model_name].render()

    def prepare_vertex_data(self):
        """
            Not from Super class; this is specific to this kind
            of Entity.
            It is basically a square surface that renders a Texture.
        """
        vertices_data = self.order_vertex_data(self.surface_vertices, self.surface_indices)

        if not self.withTextures:
            return vertices_data
        
        texture_vertices_data = self.order_vertex_data(self.texture_vertices, self.texture_indices)
        vertex_data = np.hstack([vertices_data, texture_vertices_data])
        
        return vertex_data

    def order_vertex_data(self, vertices, indices):
        """
            The reason it takes parameters
            is so that, for example, when adding textures...
            it can still be used
        """
        data = [vertices[index] for triangle in indices for index in triangle]
        return np.array(data, dtype='f4')