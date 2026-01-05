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
from .. import mgl
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
    def __init__(self, scriptRef: Script, modelName: str, shadersProgramName: str, format:str, attributes: list[str], isDynamic=False, vertexShaderName="", fragmentShaderName=""):
        self.parent_script = scriptRef
        self.ctx_ref = scriptRef.canvas_ref.ctx_ref
        self.vao_manager_ref = scriptRef.canvas_ref.vao_manager
        self.vbo_manager_ref = self.vao_manager_ref.vbo_manager
        self.shaders_program_ref = scriptRef.canvas_ref.vao_manager.shader_programs
        # self.program = self.vao_manager_ref
        #   This creates the entity's vbo and adds it to the vbo manager.
        super().__init__(self.ctx_ref, modelName, self.vbo_manager_ref, format, attributes, isDynamic)
        #   Now the program also is created, and the vao_manager knows this.
        self.shaders_program_ref.add_program(shadersProgramName, vertexShaderName, fragmentShaderName)
        #   Finally, the vao manager is created
        self.vao_manager_ref.add_vao(
            modelName, shadersProgramName
        )
        self.model_name = modelName
        self.shaders_name = shadersProgramName
        # self.textureName = ""
        #   This is the vao program that refers to the shaders; with it I can
        #   make uniforms, and such
        self.entity_program = self.vao_manager_ref.vertex_array_objects[modelName].program

        self.texture_manager_ref = scriptRef.canvas_ref.textures_manager
        self.print_count = 0

    def reload_shader(self, vertexShaderName, fragmentShaderName, isDynamic=False, texturesForRebind=[]) -> None:
        """
            Code to Reload Shader Dynamically!
            Added: 1st December - 5th December, 2025
        """
        #   delete already existing shader and vao using vao_manager!
        #   vao_manager deletes the shader too!
        self.vao_manager_ref.destroy(self.model_name, self.shaders_name)
        #   delete texture
        # if len(texturesForRebind) > 0:
        #     self.texture_manager_ref.release_these(texturesForRebind)
        
        #   create new vbo
        self.vbo: mgl.Buffer = self.create_vbo(isDynamic)
        self.vbo_manager_ref.add_vbo(self.model_name, self)
        
        #   create new shader, recompiling it
        self.shaders_program_ref.add_program(self.shaders_name,
                                            vertexShaderName=vertexShaderName,
                                            fragmentShaderName=fragmentShaderName)

        #   create new vao
        self.vao_manager_ref.add_vao(self.model_name, self.shaders_name)
        self.entity_program = self.vao_manager_ref.vertex_array_objects[self.model_name].program

        #   rebind textures from list of names - 5th December 2025
        if len(texturesForRebind) > 0:
            for tex_name in texturesForRebind:
                self.set_texture_uniform(tex_name)


    def set_uniform(self, uName, uValue):
        try:
            self.entity_program[uName] = uValue
        except KeyError as e:
            if self.print_count <= 0:
                print("Uniform Error: ", str(e))
            if (self.print_count <= 1):
                self.print_count += 1

    def get_uniform_location(self, uName):
        return self.entity_program[uName].location

    def set_complex_uniform(self, uName, uValue):
        try:
            self.entity_program[uName].write(uValue)
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
    
    def add_texture(self, textureName: str, texturePath:str, mode=1, vFlip=True):
        self.texture_manager_ref.add_texture(textureName, texturePath, mode=mode, vFlip=vFlip)
        self.set_texture_uniform(textureName)

    def add_texture_from_pg_surface(self, textureName: str, surface: pg.Surface):
        """This is for Pygame Surfaces turned Moderngl Textures """
        self.texture_manager_ref.pg_surface_to_mg_texture(textureName, surface)
        self.set_texture_uniform(textureName)
    
    def add_texture_cube(self, textureName: str, texturePath:str, vFlip=True):
        self.texture_manager_ref.add_texture_cube(textureName, texturePath)
        self.set_texture_uniform(textureName)

    def set_texture_uniform(self, textureName: str):
        """
            This can be called continually if the texture changes during runtime
            but is ideally called once
        """
        loc = self.get_uniform_location(textureName)
        self.set_uniform(textureName, loc)
        self.texture_manager_ref.textures[textureName].use(location=loc)


    def remove_texture(self, textureName: str):
        self.texture_manager_ref.release(textureName)
        

"""
    Now, to start making actual Entity Models.
"""

class MglSurfaceEntity(ShaderEntity):
    def __init__(self, scriptRef: Script, modelName: str, shadersProgamName: str, v_format="", attributes:list[str] = [], vertexShaderName="", fragmentShaderName="", isDynamic=False, withTextures:bool=False):

        self.withTextures = withTextures

        self.surface_vertices = [(-1, -1), (1, -1), (1, 1), (-1, 1)]
        #   Helps Moderngl know the order of how to reade
        #   the above vertices
        self.surface_indices = [(0,1,2), (0,2,3)]

        if (withTextures):
            self.texture_vertices = [(0, 1), (1, 1), (1, 0), (0, 0)]
            self.texture_indices = [(0,1,2), (0,2,3)]

        self.format = v_format if v_format else '2f 2f'
        self.attributes = attributes if len(attributes) > 0 else ["a_VertexPosition", "a_TexturePosition"]
        super().__init__(scriptRef, modelName, shadersProgamName, self.format, self.attributes, isDynamic=isDynamic, vertexShaderName=vertexShaderName, fragmentShaderName=fragmentShaderName)
    

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


class MglCubeEntity(ShaderEntity):
    def __init__(self, scriptRef: Script, modelName: str, shadersProgamName: str, v_format="", attributes:list[str] = [], vertexShaderName="", fragmentShaderName="", isDynamic=False, withNormals=False, withTexture=False):
        self.format = v_format if v_format else "3f 2f"
        self.with_normals = withNormals
        self.with_texture = withTexture
        self.attributes = attributes if len(attributes) > 0 else ["a_VertexPosition", "a_TexturePosition"]
        super().__init__(scriptRef, modelName, shadersProgamName, self.format, self.attributes, isDynamic=isDynamic, vertexShaderName=vertexShaderName, fragmentShaderName=fragmentShaderName)
    
    
    def render(self):
        self.vao_manager_ref.vertex_array_objects[self.model_name].render()
        

    @staticmethod
    def get_data(vertices, indices):
        data = [vertices[ind] for triangle in indices for ind in triangle]
        return np.array(data, dtype='f4')


    def prepare_vertex_data(self):
        """
            Not from Super class; this is specific to this kind
            of Entity.
            It is basically a square surface that renders a Texture.
        """
        ##  Cube's points' coordinates
        vertices = [(-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1),
                    (-1, 1, -1), (-1, -1, -1), (1, -1, -1), (1, 1, -1)]
        ##  Numbering the vertices from the front face of a cube in an anti-clockwise manner...
        ##  The vertices are numbered in 3s, forming right-angled triangles
        indices = [(0, 2, 3), (0, 1, 2),
                   (1, 7, 2), (1, 6, 7),
                   (6, 5, 4), (4, 7, 6),
                   (3, 4, 5), (3, 5, 0),
                   (3, 7, 4), (3, 2, 7),
                   (0, 6, 1), (0, 5, 6)]

        vertex_data = self.get_data(vertices, indices)
        #   Texture coordinates
        tex_coord_vertices = [(0, 0), (1, 0), (1, 1), (0, 1)]
        ##  All 12 triangles from which the cube model formed
        tex_coord_indices = [(0, 2, 3), (0, 1, 2),
                             (0, 2, 3), (0, 1, 2),
                             (0, 1, 2), (2, 3, 0),
                             (2, 3, 0), (2, 0, 1),
                             (0, 2, 3), (0, 1, 2),
                             (3, 1, 2), (3, 0, 1)]
        tex_coord_data = self.get_data(tex_coord_vertices, tex_coord_indices)

        ##  Because cubes have 6 faces, they have 6 normals:
        #   Because each face has 3 triangles, each triangle has 3 vertices
        #   so for every 6 vertices there is the same normal
        normals = [(0, 0, 1) * 6,
                (1, 0, 0) * 6,
                (0, 0, -1) * 6,
                (-1, 0, 0) * 6,
                (0, 1, 0) * 6,
                (0, -1, 0) * 6]
        normals = np.array(normals, dtype='f4').reshape(36, 3)

        if self.with_normals and self.with_texture:
            #   stacked horizontally in order vertex data, normals, tex_coord
            #   3f 3f 2f
            vertex_data = np.hstack([vertex_data, normals])
            #  Combine vertex and texture coordinate data
            vertex_data = np.hstack([vertex_data, tex_coord_data])
        elif self.with_texture:
            vertex_data = np.hstack([vertex_data, tex_coord_data])
        elif self.with_normals:
            vertex_data = np.hstack([vertex_data, normals])

        return vertex_data

    # def order_vertex_data(self, vertices, indices):
    #     """
    #         The reason it takes parameters
    #         is so that, for example, when adding textures...
    #         it can still be used
    #     """
    #     data = [vertices[index] for triangle in indices for index in triangle]
    #     return np.array(data, dtype='f4')

class MglAdvancedSkyBox(ShaderEntity):
    def __init__(self, scriptRef: Script, modelName: str, shadersProgamName: str, v_format="", attributes:list[str] = [], vertexShaderName="", fragmentShaderName="", isDynamic=False):
        self.format = v_format if v_format else "3f"
        self.attributes = attributes if len(attributes) > 0 else ["a_VertexPosition"]
        super().__init__(scriptRef, modelName, shadersProgamName, self.format, self.attributes, isDynamic=isDynamic, vertexShaderName=vertexShaderName, fragmentShaderName=fragmentShaderName)

    
    def render(self):
        self.vao_manager_ref.vertex_array_objects[self.model_name].render()
 
    
    def prepare_vertex_data(self):
        #   in clip space
        z = 0.9999

        ##  FOR ADVANCED SKYBOX USING TWO TRIANGLES
        # vertices = [
        #     (-1, -1, z), (1, 1, z), (-1, 1, z),
        #     (-1, -1, z), (1, -1, z), (1, 1, z)]
        ##  FOR ADVANCED ADVANCED SKYBOX USING ONE TRIANGLE
        vertex_data = [
            (-1, -1, z), (3, -1, z), (-1, 3, z)]
        vertex_data = np.array(vertex_data, dtype='f4')
        return vertex_data
    
