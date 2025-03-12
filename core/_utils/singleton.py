"""
    This function is to be used as a class decorator.
    This is how it works:
    Any class decorated with this will have the attribute, '._instance'
    created in it and set to the value of the first instance of that class
    created.
    So any further instantiation will always return this '_instance' attribute
    which is a reference to the first class object every instantiated from that class.
"""

# from typing import Type

def singleton(cls, *args, **kwargs):
    def get_instance(*args, **kwargs):
        if not hasattr(cls, '_instance') or not cls._instance:
            cls._instance = cls(*args, **kwargs)
        return cls._instance
    return get_instance