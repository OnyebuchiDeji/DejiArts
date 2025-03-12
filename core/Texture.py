"""
    This is the TextureManager
    It does these:

    1.  It controls loading a texture
    and creating the moderngl texture
    object.
    2.  It manages the ids of textures put
    in that program/script.
    3.  It provides functions such as converting
    a Pygame Surface to a Moderngl Texture 

    It effectively keeps track of every texture created
    at runtime and provides access to them and methods to
    destroy them when no longer in use.
"""

from . import singleton
from . import pg
from . import mgl

# from . import TYPE_CHECKING
# if TYPE_CHECKING:
#     from .Engine import Engine


@singleton
class TextureManager:
    """
        This is the Texture Manager. It is a Singleton.
        Any texture added or any texture created from a Pygame Surface
        is added into the dictionary Buffer, `textures` that stores this texture.
        Hence every texture is added through this texture manager.
    """
    textures: dict[str, mgl.Texture] = {}
    def __init__(self, ctxRef: mgl.Context):
        self.ctx_ref = ctxRef
    
    def add_texture(self, textureName: str, texturePath: str) -> None:
        """
            Note that if the texture with that name already exists, it updates its value
        """
        self.textures[textureName] = self.get_texture(path=texturePath)
    
    def get_texture(self, path: str):
        """This should not be accessed; rather use `add_texture`"""
        texture1 = pg.image.load(path).convert()
        # texture = pg.transform.flip(texture, flip_x=False, flip_y=False)
        texture = self.ctx_ref.texture(size=texture1.get_size(), components=4,
                                      data=pg.image.tostring(texture1, 'RGBA'))
        # texture = self.ctx_ref.texture(size=texture1.get_size(), components=4)
        texture.filter = (mgl.LINEAR_MIPMAP_NEAREST, mgl.LINEAR_MIPMAP_NEAREST)
        # texture.filter = (mgl.NEAREST, mgl.NEAREST)
        
        texture.build_mipmaps()
        #   This is the format in which Moderngl reads the color channels
        # texture.swizzle = 'BGRA'
        # texture.write(texture1.get_view('1'))

        #   improves texture quality
        texture.anisotropy = 32.0
        return texture
    
    # def add_texture(self, textureName, surface: pg.Surface) -> None:
    #     self.pg_surface_to_mg_texture(textureName, surface)

    def pg_surface_to_mg_texture(self, textureName: str, surface: pg.Surface) -> None:
        """
            This converts a Pygame Surface to a Moderngl Texture.
            It is not like the other textures because of this.

            Note that if that texture already exists, this updates its value.
        """
        texture = self.ctx_ref.texture(surface.get_size(), 4)
        texture.filter = (mgl.NEAREST, mgl.NEAREST)
        #   This is the format in which Moderngl reads the color channels
        texture.swizzle = 'BGRA'
        texture.write(surface.get_view('1'))

        ##
        self.textures[textureName] = texture
        

    """
        Note that the texture data is autamatically destroyed when the vbo is destroyed
    """
    def release_all(self):
        [tex.release() for tex in self.textures.values()]
        self.textures.clear()
        print("Textures Destroyed")

    def release(self, textureName):
        self.textures.pop(textureName).release()

    def release_these(self, *textureNames):
        # [value.release() for texture_name, value  in self.textures.items() for name in textureNames if texture_name != name]
        [self.textures.pop(texture_name).release() for texture_name in textureNames]
