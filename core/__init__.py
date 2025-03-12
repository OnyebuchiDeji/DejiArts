import pygame as pg
import moderngl as mgl
import numpy as np
import sys
import threading
from ._utils.singleton import singleton


"""
    This TYPE_CHECKING prevents circular imports during runtime and Complex importing orders.
    It is used for imports that are so that I can specify the type hints of classes I create
    that are used as members of another class.
    It is used this way:
    if TYPE_CHECKING:
        from <> import <>
    This import statement is only processed by the Type checker, but does not actually
    import anything during runtime.
    Hence, it's for when I import anything jst because I want to use it as a Type Hint, so that
    the Type Checker recognises that class and intellisense can show me its methods and members.

"""
from typing import TYPE_CHECKING


__all__ = ['Canvas', 'Designer', 'Engine', 'Recorder', 'Scene']