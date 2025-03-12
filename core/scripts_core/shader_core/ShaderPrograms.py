"""
    This provides a simple way to manage every shader program
    that is created.
    It manages creating them and deleting them, storing them in a buffer.
    It is also a Singleton.
    it provides a neat way to clear them all.
"""

from ... import mgl
from ... import singleton
import os

@singleton
class ShaderProgramsManager:
    shader_scripts_dir: str = os.path.join(__file__, "..","shader_scripts")
    programs: dict[str, mgl.Program] = {}
    def __init__(self, ctxRef):
        self.ctx_ref = ctxRef
        
    
    def add_program(self, shadersProgramName:str):
        """
            Creates a program from the corrsponding Vertex and Fragment shaders.
            Ensure the vertex and fragment shaders have the same name.
        """
        path = os.path.join(self.shader_scripts_dir,shadersProgramName)
        print(path)
        with open(f'{path}.vert') as f_stream:
            vertex_shader = f_stream.read()
        with open(f'{path}.frag') as f_stream:
            fragment_shader = f_stream.read()
        
        program = self.ctx_ref.program(vertex_shader=vertex_shader, fragment_shader=fragment_shader)
        self.programs[shadersProgramName] = program
    
    def destroy_all(self):
        [program.release() for program in self.programs.values()]
        self.programs.clear()
    
    def destroy(self, programName):
        """Destroy the shader program with the specified name"""
        self.programs.pop(programName).release()

    def destroy(self, *programNames):
        """Destroy the shader programs with the listed name"""
        [self.programs.pop(program_name).release() for program_name in programNames]