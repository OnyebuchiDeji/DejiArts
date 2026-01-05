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
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "20230129_112910.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "Keele_Tree.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "Keele_Tree2.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "20240604_200646.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "20240604_200646_2.jpg")
        
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "20241225_143317.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "20241225_143354.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "my_photo-23_12_2024.png")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "red_diamond_heart.jpg")
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "spider_3d_image1a.jpg")
        self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "Rhododendron.jpg")

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
            self, self.sPN, self.sPN, "2f 2f",
            ["vertexPosition", "texturePosition"], self.vertShaderName, self.fragShaderName, withTextures=True
        )

        #3  Don't actually need texture coordinates; can use the vertexPositions instead and normalize in fragment shader
        #   But using texture coordinates worls smoother
        # self.gl_surface = MglSurfaceEntity(
        #     self, self.sPN, self.sPN, "2f",
        #     ["vertexPosition"], self.vertShaderName, self.fragShaderName, withTextures=False
        # )

        #   Adds texture just once
        self.gl_surface.add_texture("texture1", self.texturePath, False)
        self.gl_surface.set_uniform("u_image_size", pg.image.load(self.texturePath).get_size())

        # self.canvas_ref.surface.fill("black")

        print("Ran Oninit Once")
    
    #   By adding a here, this is run first
    def a_run_render(self):
        self.gl_surface.set_uniform('u_resolution', self.canvas_ref.designer_ref.engine_ref.win_dimensions)
        self.gl_surface.set_uniform('u_time', float(self.canvas_ref.designer_ref.engine_ref.time))
        self.gl_surface.render()
    
    def get_click_event(self):
        if (self.engine_ref.get_pressed_key(pg.K_s)):
            # print("Called")
            # print("Canvas Ref Object:", self.canvas_ref)
            # print("Canvas Ref Context:", self.canvas_ref.ctx_ref)
            # print("Context Screen Pixels:", self.canvas_ref.ctx_ref.screen.read(attachment=1,components=4, dtype="f1"))

            self.recorder.save_image_pil_impl(self.canvas_ref.ctx_ref, format=".jpg")

def RunPaintingsApp():
    my_engine = Engine(winDimensions=(3000, 2400))
    #   Must initialize the script with a canvas
    file_path = os.path.dirname(__file__)
    my_engine.designer.canvas_ref.vao_manager.shader_programs.shader_scripts_dir = os.path.join(file_path, "shaders")
    
    my_script = BasicShaderScript(canvasRef=my_engine.designer.canvas_ref, 
                                  shaderProgramName="ThePaintings",
                                  vertShaderName="shader1", fragShaderName="shader2b")

    my_engine.designer.canvas_ref.scene.add_script("ThePaintings", my_script)
    my_engine.run()


def main():
    RunPaintingsApp()