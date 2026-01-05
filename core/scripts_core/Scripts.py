"""
    This is the Meta or Abstract or Generic Class called a Script.
    Scripts are objects that contain methods that cntain the blocks
    of code to produce a particular art design.

    Scripts have access to Entities.
    Every script has its own moderngl context program.
    
"""

from .. import TYPE_CHECKING

if TYPE_CHECKING:
    from ..Canvas import Canvas

class Script:
    """
        You can define as many methods in a script as
        needed to accomplish an effect.
        A Script has a name/title, a brief description of what it does,
        the reference to the canvas, and several methods that contain
        the code to produce a desired art.

        Any method can be appended to the `excluded` list. These methods hence run once. In it you can specify anythin that
        you want done that cannot be done in the __init__ method due to semantic reasons.
    """
    excluded_methods = ['__init__', 'run_all']
    canvas_ref = None

    def __init__(self, canvasReference: 'Canvas'):
        """Every Script should have access to these"""
        self.canvas_ref = canvasReference

    
    def run_all(self):
        """
            This looks at every method defined here
            and calls it, effectively rendering whatever is in them.
            The methods it calls must not have any parameters or take any argument besides self

            How it works:
                For every attribute in this Class's instance...
                if the value of that attribute, which is gotten by `getattr(A, B)` --- given that A is the instance
                of the class, B is the member attribute and `getattr(A, B)` is equivalent to doing A.B
                to access the value of that attribute with name B --- is a function object, meaning that
                its class signature has the built-in attribute '__func__' (Note that all a class's members can be
                printed out using `dir()` function), and the attribute name of this class is not '__init__' and is not
                this function itself 'run_all', lest it causes recursion, then add the name of that attribute.
                It is certainly a method. 
            
            Furthermore:
                The methods are arranged in the list in alphabetical order.
                Hence, I am to ensure that methods I want to be run first are prefixed
                appropriately to indicate the order.
        """
        #   Get all methods' names
        methods = [attr for attr in dir(self) if '__func__' in dir(getattr(self, attr)) and attr not in self.excluded_methods]
        for method in methods:
            #   call the method
            getattr(self, method)()



class ShaderScript:
    """
        A ShaderScript is almost like a script, with a name/title, brief description
        but not several methods with code that create the art.
        These are done in the shaders.
        Rather, these scripts are linked to individual shader scripts.
        It controls the VBO, VAO, and rendering the VAO
        to display what is done in the corresponding shader scripts.

        Furthermore, it controls the instantiaces of the objects put in it because
        it is in control of what the Shader receivess; the shaders just controls the effects
        of how its rendered on the screen.
    """
    ...


    