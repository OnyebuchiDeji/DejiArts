"""
    A Scene is a beautiful collection of Scripts that together
    paint on the Canvas.
    The Scene gives the Scripts access to the Canvas. 
"""

from .scripts_core.custom_scripts.circle_field import *
from .scripts_core.Scripts import Script
from . import TYPE_CHECKING
# from . import threading

if TYPE_CHECKING:
    from .Canvas import Canvas

class Scene:
    def __init__(self, canvasRef: 'Canvas'):
        self.canvas_ref = canvasRef
        self.scripts: dict[str, Script] = {}
        # self.scripts['circleField'] = CircleFieldScript(canvasRef)
    
    def add_script(self, scriptName, scriptRef):
        self.scripts[scriptName] = scriptRef
        self.scripts[scriptName].canvas_ref = self.canvas_ref
    
    def render(self):
        for script in self.scripts.values():
            script.run_all()