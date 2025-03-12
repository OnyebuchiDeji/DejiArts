"""
    This manages every Vertex Array Object that is created.
    It creates and provides access to the VAO for every Entity created.
    Keep in knowledge that this defines what the shader scripts receive concerning
    each entity.

    They, however, are not ShaderScripts because they only manage creating the VAO,
    liking the right program and VBO to create the final 'render object', the VAO
    for that specific Entity, and is used to destroying them.
"""
from ... import singleton
from ... import mgl

from .ShaderPrograms import ShaderProgramsManager
from .VertexBuffer import VertexBufferObjectsManager
from .VertexBuffer import BaseVertexBufferObject
    

# from ... import TYPE_CHECKING
# if TYPE_CHECKING:

# @singleton
class VertexArrayObjectsManager:
    vertex_array_objects: dict[str, mgl.VertexArray]= {}
    def __init__(self, ctxRef: mgl.Context):
        self.ctx_ref = ctxRef
        self.vbo_manager: VertexBufferObjectsManager = VertexBufferObjectsManager()
        self.shader_programs: ShaderProgramsManager = ShaderProgramsManager(ctxRef)
    
    def add_vao(self, modelName, shaderProgramName: str):
        self.vertex_array_objects[modelName] = self.create_vao(
            shaderProgram = self.shader_programs.programs[shaderProgramName],
            vertexBufferObject = self.vbo_manager.vertex_buffer_objects[modelName]
        )
    
    def create_vao(self, shaderProgram, vertexBufferObject: BaseVertexBufferObject):
        vao = self.ctx_ref.vertex_array(shaderProgram, [(
                                    vertexBufferObject.vbo,
                                    vertexBufferObject.format,
                                    *vertexBufferObject.attributes
                                    )])
        return vao
        
    def destroy_all(self):
        self.vbo_manager.destroy_all()
        self.shader_programs.destroy_all()
        [vao.release() for vao in self.vertex_array_objects.values()]
        self.vertex_array_objects.clear()
        print("Destroyed all.")

    def destroy(self, modelName="", programName=""):
        self.vertex_array_objects.pop(modelName).release()

        if len(modelName) > 1 and len(programName) > 1:
            self.vbo_manager.destroy(modelName)
            self.shader_programs.destroy(programName)
        elif len(modelName) > 1:
            self.vbo_manager.destroy(modelName)
        elif len(programName) > 1:
            self.shader_programs.destroy(programName)
        else:
            raise Exception("Neither Program nor Model Name Specified to Destroy")
