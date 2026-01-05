"""
    Date Started: Wednesday 16th April, 2025

    Found that the texture image 
    Found that any method that starts with __, even if it is not implemented in Python's core
    is reserved
"""
from core.Engine import Engine
from core.scripts_core.Scripts import Script
from core.entities_core.ShaderEntities import MglCubeEntity, MglAdvancedSkyBox
from core.Recorder import Recorder
import os
import pygame as pg
import glm


FOV = 100
NEAR = 0.1
FAR = 100
SPEED = 0.01
SENSITIVITY = 0.07
class Camera:
    def __init__(self, win_size=(0, 0), position=(0, 0, 4), yaw=-90, pitch=0):
        self.aspect_ratio = win_size[0] / win_size[1]
        self.position = glm.vec3(position)
        self.up = glm.vec3(0, 1, 0)
        self.right = glm.vec3(1, 0, 0)
        self.forward = glm.vec3(0, 0, -1)
        self.yaw = yaw
        self.pitch = pitch
        #   View matrix
        ##  Used to control where the camera looks from
        self.m_view = self.get_view_matrix()
        ##  Used to add effects of depth and perspective
        #   Projection Matrix
        self.m_proj = self.get_projection_matrix()
        self.delta_time = 0

    def update(self, dt):
        self.delta_time = dt
        self.move()
        self.rotate()
        self.update_camera_vectors()
        ##  To update view matrix after moving
        self.m_view = self.get_view_matrix()

    def rotate(self):
        rel_x, rel_y = pg.mouse.get_rel()
        self.yaw += rel_x * SENSITIVITY
        self.pitch -= rel_y * SENSITIVITY
        ##  Limiting pitch movement to prevent unnatural movements up and down
        self.pitch = max(-89, min(89, self.pitch))

    def update_camera_vectors(self):
        yaw, pitch = glm.radians(self.yaw), glm.radians(self.pitch)
        ##  Because the forward vectir is responsible for camera's orientation...
        ##  using geometry where the forward vector is like the resultant vector, and z and x are the right and up...
        ##  and one where forward is the resultant but now, y and x or z are the others
        self.forward.x = glm.cos(yaw) * glm.cos(pitch)
        self.forward.y = glm.sin(pitch)
        self.forward.z = glm.sin(yaw) * glm.cos(pitch)

        self.forward = glm.normalize(self.forward)
        self.right = glm.normalize(glm.cross(self.forward, glm.vec3(0, 1, 0)))
        self.up = glm.normalize(glm.cross(self.right, self.forward))

    def move(self):
        velocity = SPEED * self.delta_time
        keys = pg.key.get_pressed()
        if keys[pg.K_w]:
            self.position += self.forward * velocity
        if keys[pg.K_s]:
            self.position -= self.forward * velocity
        if keys[pg.K_a]:
            self.position -= self.right * velocity
        if keys[pg.K_d]:
            self.position += self.right * velocity
        if keys[pg.K_q]:
            self.position += self.up * velocity
        if keys[pg.K_e]:
            self.position -= self.up * velocity

    def get_view_matrix(self):
        ##  glm.lookAt(eye, center, up) -> glm.mat4
        ##  eye - camera position
        ##  center - position of where camera is looking atexit
        ##  Normalized up vector, how the camera is oriented
        #
        ##return glm.lookAt(self.position, glm.vec3(0), self.up)
        #   The above was changed after camera controls were added because pf the fact that the camera was always looking...
        #   at the model's centre, its movement was being affected because its orientation was...
        #   fixed to the camera's centre
        return glm.lookAt(self.position, self.position + self.forward, self.up)

    def get_projection_matrix(self):
        return glm.perspective(glm.radians(FOV), self.aspect_ratio, NEAR, FAR)

class BasicShaderScript(Script):
    def __init__(self, canvasRef=None, shaderProgramName="", vertShaderName="", fragShaderName="",
                skyboxShaderProgramName="" , skyboxVertShaderName="", skyboxFragShaderName=""):
        super().__init__(canvasRef)
        self.sPN = shaderProgramName
        self.skySPN = skyboxShaderProgramName 
        self.vertShaderName = vertShaderName
        self.fragShaderName = fragShaderName
        self.skyboxVertexShaderName = skyboxVertShaderName
        self.skyboxFragmentShaderName = skyboxFragShaderName
        # self.texturePath = os.path.join(os.path.dirname(__file__), "resources", "Rhododendron.jpg")

        self.excluded_methods.append("_oninit")
        self.excluded_methods.append("_get_model_matrix")
        self.excluded_methods.append("_set_camera")
        self.excluded_methods.append("_move")

        self.output_image_path = os.path.join(os.path.dirname(__file__), "outputs", "imgs")
        self.recorder = Recorder(self.output_image_path)
        self.engine_ref = self.canvas_ref.designer_ref.engine_ref
        self.camera = None

        self.pos=glm.vec3(0, 0, 0)
        self.rot = glm.vec3([glm.radians(a) for a in (0, 0, 0)])
        self.scale=glm.vec3(1, 1, 1)

        self._oninit()
    
    def _set_camera(self, cameraObj: Camera):
        self.camera = cameraObj

    def _get_model_matrix(self):
        m_model = glm.mat4()
        #   Translate
        m_model = glm.translate(m_model, self.pos)
        #   Rotate
        m_model = glm.rotate(m_model, self.rot.x, glm.vec3(0, 0, 1))
        m_model = glm.rotate(m_model, self.rot.y, glm.vec3(0, 1, 0))
        m_model = glm.rotate(m_model, self.rot.z, glm.vec3(1, 0, 0))
        #   Scale
        m_model = glm.scale(m_model, self.scale)

        return m_model

    def _move(self, dt):
        velocity = SPEED * dt
        keys = pg.key.get_pressed()
        if keys[pg.K_UP]:
            self.pos.y += velocity
        if keys[pg.K_DOWN]:
            self.pos.y -= velocity
            # self.position -= self.forward * velocity
        if keys[pg.K_LEFT]:
            self.pos.x -= velocity
        if keys[pg.K_RIGHT]:
            self.pos.x += velocity

    def _oninit(self):
        #   Create the Render Surface
        #   format has two 2fs, one for vertex coordinates; the other for texture
        """
            Using texture coordinates saves the hassle of flipping the image on load and transforming the render
            uv space.

            Also, any attribute not utilized in the shader will cause an error saying KeyError '<attr name> no such key exists'
            --- I paraphrase
        """
        # self.gl_surface = MglCubeEntity(
        #     self, self.sPN, self.sPN, v_format="3f 3f 2f",
        #     attributes=["a_VertexPosition", "a_Normal", "a_TexPosition"], vertexShaderName=self.vertShaderName,
        #     fragmentShaderName=self.fragShaderName
        # )
        # self.gl_surface = MglCubeEntity(
        #     self, self.sPN, self.sPN, v_format="3f 2f",
        #     attributes=["a_VertexPosition", "a_TexturePosition"], vertexShaderName=self.vertShaderName,
        #     fragmentShaderName=self.fragShaderName, withNormals=False
        # )

        #   no textures and no normals
        self.gl_surface = MglCubeEntity(
            self, self.sPN, self.sPN, v_format="3f",
            attributes=["a_VertexPosition"], vertexShaderName=self.vertShaderName,
            fragmentShaderName=self.fragShaderName, withNormals=False, withTexture=False
        )

        #   Adds texture just once
        # tex_path = os.path.join(os.path.dirname(__file__), "textures", "fur.jpg")
        # self.gl_surface.add_texture("u_Texture", tex_path, False)   #   no flipping of jpgs

        # self.gl_surface.add_texture("texture1", self.texturePath, False)
        # self.gl_surface.set_uniform("u_image_size", pg.image.load(self.texturePath).get_size())

        #   for the skybox
        self.skybox = MglAdvancedSkyBox(
            self, self.skySPN, v_format="3f", attributes=["a_VertexPosition"],
            shadersProgamName=self.skySPN,
            vertexShaderName=self.skyboxVertexShaderName,
            fragmentShaderName=self.skyboxFragmentShaderName,
        )

        self.skybox.add_texture_cube("u_TextureSkybox",
                                     os.path.join(os.path.dirname(__file__), "textures"))

        # self.canvas_ref.surface.fill("black")

        print("Ran Oninit Once")
    
    #   By adding a here, this is run first
    def a_run_render(self):
        self.gl_surface.set_complex_uniform('u_CameraPosition', self.camera.position)
        self.gl_surface.set_complex_uniform('u_ModelMat', self._get_model_matrix())
        self.gl_surface.set_complex_uniform('u_ViewMat', self.camera.m_view)
        self.gl_surface.set_complex_uniform('u_ProjMat', self.camera.m_proj)
        self.gl_surface.set_complex_uniform('u_InvProjViewMat', glm.inverse(self.camera.m_proj * self.camera.m_view))
        # self.gl_surface.set_complex_uniform('u_MVP', self.camera.m_proj * self.camera.m_view * self._get_model_matrix())

        # self.gl_surface.set_uniform('u_resolution', self.canvas_ref.designer_ref.engine_ref.win_dimensions)
        # self.gl_surface.set_uniform('u_time', float(self.canvas_ref.designer_ref.engine_ref.time))
        # self.gl_surface.set_uniform('u_mouse', self.canvas_ref.designer_ref.engine_ref.get_mouse_pos())
        
        self.skybox.set_complex_uniform('u_InvProjViewMat', glm.inverse(self.camera.m_proj * self.camera.m_view))
        
        """
            All I had to do was render the skybox first before the
            Cube.
            That way, when I make the cube transparent to make just
            the Torus visible, the cube will actually become transparent
            showing the Skymap background!

            Although I considered this, I still tried making the skybox render
            a texture, passing it to the `ep4-ray_marching_unity` shader
            to try to make the cube show the corresponding parts of the skybox.
            It was needless given this!

            I succesffuly passed the skybox render as a texture but couldn't make it
            so that it appears properly on the cube to create the effect of making the
            cube see-through without the above solution.

        """
        self.skybox.render()
        #   For Dynamic Textures (textures updated every frame)
        #   You must destroy the the old after rendering it to help free RAM
        #   Also, note no mipmap filtering was done for the render data when making the
        #   the texture since it's not from an image file!
        # skyboxRenderTextureData = self.skybox.vao_manager_ref.vertex_array_objects[self.skySPN].ctx.screen.read(components=3)
        # skyboxRenderTexture = self.canvas_ref.ctx_ref.texture(
        #     self.canvas_ref.dimensions, components=3, data=skyboxRenderTextureData
        # )

        # self.gl_surface.set_uniform("u_SkyRenderTexture", 1)
        # skyboxRenderTexture.use(location=1)
        self.gl_surface.render()

        # skyboxRenderTexture.release()

        self.camera.update(self.canvas_ref.designer_ref.engine_ref.delta_time)
        self._move(self.canvas_ref.designer_ref.engine_ref.delta_time)

    
    def get_click_event(self):
        # if (self.engine_ref.get_pressed_key(pg.K_s)):
            # print("Called")
            # print("Canvas Ref Object:", self.canvas_ref)
            # print("Canvas Ref Context:", self.canvas_ref.ctx_ref)
            # print("Context Screen Pixels:", self.canvas_ref.ctx_ref.screen.read(attachment=1,components=4, dtype="f1"))
            # self.recorder.save_image_pil_impl(self.canvas_ref.ctx_ref, format=".jpg")

        if (self.engine_ref.get_pressed_key(pg.K_r)):
            self.gl_surface.reload_shader(self.vertShaderName, self.fragShaderName)

def RunApp():
    #  was 1200 by 675/
    #   There was an issue with scaling the star field
    #   thought it'll be solved by changing width dimensions
    #   from 1200x675 to 800x450. But nope
    my_engine = Engine(winDimensions=(1120, 630))
    my_engine.designer.canvas_ref.clear_color = (0.08, 0.16, 0.18)


    #   Must initialize the script with a canvas
    file_path = os.path.dirname(__file__)
    my_engine.designer.canvas_ref.vao_manager.shader_programs.shader_scripts_dir = os.path.join(file_path, "RayTracing")
    
    my_script = BasicShaderScript(canvasRef=my_engine.designer.canvas_ref, 
                                  shaderProgramName="TheArtOfCode",
                                  vertShaderName="ep4-ray_marching_unity", fragShaderName="ep4-ray_marching_unity",
                                  skyboxShaderProgramName="TheArtOfCodeSkybox",
                                  skyboxVertShaderName="ep4-skybox", skyboxFragShaderName="ep4-skybox")
                 
    #   setup mouse effects for camera
    pg.event.set_grab(True)
    pg.mouse.set_visible(False)
    camera = Camera(win_size=my_engine.win_dimensions)
    my_script._set_camera(camera)

    my_engine.designer.canvas_ref.scene.add_script("TheArtOfCode", my_script)
    my_engine.run()


def main():
    RunApp()