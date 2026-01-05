"""
    Date Started: Wednesday 16th April, 2025

    Found that the texture image 
    Found that any method that starts with __, even if it is not implemented in Python's core
    is reserved
"""

from core.Engine import Engine
from core.scripts_core.Scripts import Script
from core.entities_core.ShaderEntities import MglSurfaceEntity
from core.Recorder import Recorder
import os
import pygame as pg


class BasicShaderScript(Script):
    def __init__(self, canvasRef=None, shaderProgramName="", vertShaderName="", fragShaderName=""):
        super().__init__(canvasRef)
        self.sPN = shaderProgramName
        self.vertShaderName = vertShaderName
        self.fragShaderName = fragShaderName
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "Rhododendron.jpg")
        self.tex_paths = []

        self.excluded_methods.append("_oninit")

        self.output_image_path = os.path.join(os.path.dirname(__file__), "outputs", "imgs")
        self.recorder = Recorder(self.output_image_path)
        self.engine_ref = self.canvas_ref.designer_ref.engine_ref

        self._oninit()

    def _oninit(self):
        #   Create the Render Surface
        #   format has two 2fs, one for vertex coordinates; the other for texture
        """
            Using texture coordinates saves the hassle of flipping the image on load and transforming the render
            uv space.
        """
        self.gl_surface = MglSurfaceEntity(
            self, self.sPN, self.sPN, v_format="2f",
            attributes=["a_VertexPosition"], vertexShaderName=self.vertShaderName,
            fragmentShaderName=self.fragShaderName, withTextures=False
        )
        self.tex_paths.append(os.path.join(os.path.dirname(__file__), "textures", "beast_pic.jpg"))
        # self.tex_paths.append(os.path.join(os.path.dirname(__file__), "textures", "Logo.png"))
        self.gl_surface.add_texture("u_Texture0", self.tex_paths[0], mode=1, vFlip=False)   #   no flipping of jpgs

        self.tex_paths.append(os.path.join(os.path.dirname(__file__), "textures", "Logo.png"))
        self.gl_surface.add_texture("u_Texture1", self.tex_paths[1], mode=1, vFlip=True)   #    do flip .png 

        self.tex_paths.append(os.path.join(os.path.dirname(__file__), "textures", "black_marble1.png"))
        self.gl_surface.add_texture("u_Texture2", self.tex_paths[2], mode=1, vFlip=True)   #    do flip .png 

        print("Ran Oninit Once")
    
    #   By adding a here, this is run first
    def a_run_render(self):
        self.gl_surface.set_uniform('u_resolution', self.canvas_ref.designer_ref.engine_ref.win_dimensions)
        self.gl_surface.set_uniform('u_time', float(self.canvas_ref.designer_ref.engine_ref.time))
        self.gl_surface.set_uniform('u_mouse', self.canvas_ref.designer_ref.engine_ref.get_mouse_pos())
        self.gl_surface.render()
    
    def get_click_event(self):
        if (self.engine_ref.get_pressed_key(pg.K_s)):
            # print("Called")
            # print("Canvas Ref Object:", self.canvas_ref)
            # print("Canvas Ref Context:", self.canvas_ref.ctx_ref)
            # print("Context Screen Pixels:", self.canvas_ref.ctx_ref.screen.read(attachment=1,components=4, dtype="f1"))
            self.recorder.save_image_pil_impl(self.canvas_ref.ctx_ref, format=".jpg")

        if (self.engine_ref.get_pressed_key(pg.K_r)):
            self.gl_surface.reload_shader(self.vertShaderName, self.fragShaderName, texturesForRebind=['u_Texture0', 'u_Texture1', 'u_Texture2'])#, texturePathsForRebind=self.tex_paths)

def RunApp():
    my_engine = Engine(winDimensions=(1120, 630))

    #   Must initialize the script with a canvas
    file_path = os.path.dirname(__file__)
    my_engine.designer.canvas_ref.vao_manager.shader_programs.shader_scripts_dir = os.path.join(file_path, "RayTracing")
    
    my_script = BasicShaderScript(canvasRef=my_engine.designer.canvas_ref, 
                                  shaderProgramName="TheArtOfCode",
                                  vertShaderName="ep7-texture_procedural_object", fragShaderName="ep7-texture_procedural_object")

    my_engine.designer.canvas_ref.scene.add_script("TheArtOfCode", my_script)
    my_engine.run()


def main():
    RunApp()