"""
    This is like the Vertex Array Objects Manager, but for
    Vertex Buffer Objects.
    It provides methods to create, access, and destroy the Vertex Data
    of every Entity that can be made.
    It provides the functions to order these data in a way that ModernGL can render it.

    It also provides the functionality to load the vertex data of models.
    This is the role of this VertextBuffer.py module.
"""
from ... import singleton
from ... import mgl
# from ... import TYPE_CHECKING

# if TYPE_CHECKING:
#     from ... import mgl
    # from ...entities_core.ShaderEntities import ShaderEntity

@singleton
class VertexBufferObjectsManager:
    """
        Note that this does not store the actual mgl.VertexObject
        but rather the class that is a wrapper for it, which also
        contains information like the format and attributes
        to be accessed by the VAO Manager when creating
        the VAO for that object. 
    """
    vertex_buffer_objects: dict[str, 'BaseVertexBufferObject'] = {}
    def __init__(self):
        ...
    
    def add_vbo(self, modelName, modelVBOObject: 'BaseVertexBufferObject', modelPath="", materialAvaialble=False):
        self.vertex_buffer_objects[modelName] = modelVBOObject
    
    def destroy_all(self):
        [base_vbo.destroy() for base_vbo in self.vertex_buffer_objects.values()]
        self.vertex_buffer_objects.clear()

    
    def destroy(self, modelName):
        self.vertex_buffer_objects.pop(modelName).destroy()
        

    def destroy_these(self, *modelNames):
        """Destroy the Buffer Objects of the listed module names"""
        [self.vertex_buffer_objects.pop(modelName) for modelName in modelNames]
    

class BaseVertexBufferObject:
    def __init__(self,
                ctxRef: mgl.Context,
                modelName: str,
                vboManagerReference: VertexBufferObjectsManager,
                format: str,
                attributes: list[str],
                isDynamic:bool=False
                ):
        """
            This is a wrapper over everything that concerns
            a Vertex Buffer Object.

            It is also a template/abstract class/meta class for
            every Script Entity that will be created.
            It is inherited by them and thods 

            This manages the specifying and ordering of vertex
            data that make up a shape, e.g. a Cube, and then
            finally creating the Vertex Buffer object.
        """
        self.ctx_ref = ctxRef
        self.vbo: mgl.Buffer = self.create_vbo(isDynamic)
        self.vbo_manager_ref = vboManagerReference
        self.vbo_manager_ref.add_vbo(modelName, self)
        self.model_name = modelName
        self.format: str = format
        self.attributes: list[str] = attributes
    
    def prepare_vertex_data(self):
        ...
    
    def create_vbo(self, isDynamic:bool) -> mgl.Buffer:
        vertex_data = self.prepare_vertex_data()
        vbo = self.ctx_ref.buffer(vertex_data, reserve=0, dynamic=isDynamic)
        return vbo

    def destroy(self):
        self.vbo.release()