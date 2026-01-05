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
from PIL import Image
import os
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
    textures: dict[str, mgl.Texture | mgl.TextureCube] = {}

    def __init__(self, ctxRef: mgl.Context):
        self.ctx_ref = ctxRef
        self.var1 = None

    def add_texture(self, textureName: str, texturePath: str, mode=1, vFlip=True) -> None:
        """
            Note that if the texture with that name already exists, it updates its value
        """
        match mode:
            case 1:
                self.textures[textureName] = self.get_texture(path=texturePath, vFlip=vFlip)
            case 2:
                self.textures[textureName] = self.get_texture_pil_impl(path=texturePath, vFlip=vFlip)


    def add_texture_cube(self, textureCubeName: str, texturesPath: str, texturesExt: str = "png") -> None:
        self.textures[textureCubeName] = self.get_texture_cube(texturesPath, texturesExt)
 

    # def get_texture_from_render_vao(self, )
    
    
    def get_texture(self, path: str, vFlip=True):
        """
            This should not be accessed; rather use `add_texture`

            Should flip with:
                pg.transform.flip(Surface, flip_x=False, flip_y=True)
            OR:
                pg.image.tostring(Surface, "RGBA", True | False) 
        """
        imageName = os.path.basename(path)

        #   JPG images only have rgb so use .convert() to ensure loading in rgb
        image_surf = pg.image.load(path).convert()
        if ".jpg" in imageName:
            #   But can add fake alpha which sets to opaque:
            image_surf = image_surf.convert_alpha()
            image_data = pg.image.tostring(image_surf, "RGBA", vFlip)
            
        else:
            #   Use `.convert_alpha` for .png to ensure the image is in 32-bit RGBA
            image_surf = pg.image.load(path).convert_alpha()
            image_data = pg.image.tostring(image_surf, "RGBA", vFlip)

        texture = self.ctx_ref.texture(size=image_surf.get_size(), components=4,
                                    data=image_data)
        texture.filter = (mgl.LINEAR_MIPMAP_NEAREST, mgl.LINEAR_MIPMAP_NEAREST)
        # texture.filter = (mgl.LINEAR_MIPMAP_LINEAR, mgl.LINEAR)
        # texture.filter = (mgl.NEAREST, mgl.NEAREST)
        texture.build_mipmaps()

        #   improves texture quality
        texture.anisotropy = 32.0
        return texture
    
    def get_texture_pil_impl(self, path: str, vFlip=True):
        # Load image with PIL and auto-convert format
        img = Image.open(path)

        if img.mode == "RGB":
            components = 3
        else:
            img = img.convert("RGBA")  # force alpha if needed
            components = 4

        # Flip image vertically (OpenGL uses bottom-left origin)
        img = img.transpose(Image.FLIP_TOP_BOTTOM) if vFlip else img
        # img = img.rotate(Image.CLOCKWI)

        # Convert to raw byte data
        image_data = img.tobytes()
        
        texture = self.ctx_ref.texture(img.size, components, image_data)

        texture.filter = (mgl.LINEAR_MIPMAP_NEAREST, mgl.LINEAR_MIPMAP_NEAREST)
        
        texture.build_mipmaps()

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
        

    def get_texture_cube(self, dir_path, ext='png'):
        ##  Order to load texture
        ##  -1 means start from the last item, 'back', thereby returning ['back', 'front']
        faces = ['right', 'left', 'top', 'bottom'] + ['front', 'back'][::-1]
        ##textures = [pg.image.load(dir_path + f'{face}.{ext}').convert() for face in faces]
        textures = []
        ##  To fix the mirror effect that makes the text not appear correctly, which show that the image is mirrored
        for face in faces:
            texture = pg.image.load(os.path.join(dir_path, f'{face}.{ext}')).convert()
            if face in ['right', 'left','front', 'back']:
                ##  Flip the horizontal textures on the x-axis
                texture = pg.transform.flip(texture, flip_x=True, flip_y=False)
            else:
                texture = pg.transform.flip(texture, flip_x=False, flip_y=True)
            textures.append(texture)

        size = textures[0].get_size()
        ##  Empty cube texture
        texture_cube = self.ctx_ref.texture_cube(size=size, components=3, data=None)

        for i in range(6):
            ##  Translate textures into a byte string
            texture_data = pg.image.tostring(textures[i], 'RGB')
            ##  Use write method to write texture data for corresponding face of cube texture
            texture_cube.write(face=i, data=texture_data)

        return texture_cube


    """
        Note that the texture data is autamatically destroyed when the vbo is destroyed
    """
    def release_all(self):
        [tex.release() for tex in self.textures.values()]
        self.textures.clear()
        # self.texture_uniform_count = 0
        print("Textures Destroyed")

    def release(self, textureName):
        self.textures.pop(textureName).release()
        # self.texture_uniform_count -= 1

    def release_these(self, textureNames):
        # [value.release() for texture_name, value  in self.textures.items() for name in textureNames if texture_name != name]
        [self.textures.pop(texture_name).release() for texture_name in textureNames]
        # for _ in range(len(textureNames)):
            # self.texture_uniform_count -= 1