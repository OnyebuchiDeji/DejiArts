import pygame as pg


pg.init()

class Caligraphy:
    def __init__(self, text:str, pos:tuple, color = (255, 255, 255), font_type: str = "Verdeba", font_size: int = 45):
        self.font_size = font_size
        self.text = text
        self.x, self.y = pos

        self.color = color
        self.font = pg.font.SysFont(font_type, self.font_size)

        self.fontSurf = self.font.render(self.text, True, self.color)
        self.text_size = self.text_width, self.text_height = self.get_text_size()
    
    def get_text_size(self):
        font_rect = self.fontSurf.get_rect()
        return (font_rect.width, font_rect.height)

    def get_surface(self):
        return self.fontSurf

