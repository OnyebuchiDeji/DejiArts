"""
    This is the Recorder; it contains the methods that allow the
    pixels of the screen to be saved either as a photo or as a recording.
    As the name implies, it saves the generated art as a video!
"""

import pygame as pg
import numpy as np
from PIL import Image
import os
import tkinter as tk
from tkinter.simpledialog import askstring
# import typing

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    import moderngl

class Recorder:
    def __init__(self, targetDir):
        self.output_dir = targetDir
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    # def save_image_cv_impl(self, glContext, imageName: str, format:str=".png"):
    #     #   Full Target Path
    #     ftp = os.path.join(self.output_dir, imageName + format)
    #     raw = glContext.screen.read(components=4, dtype='f1')
    #     image_data = np.frombuffer(raw, dtype='uint8').reshape(
    #         ((*self.RES[1::-1], 4))
    #     )
    #     image_data = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
    #     cv2.imwrite(ftp, image_data)
    #     print("Saved Image {} at\n{}".format(ftp, self.output_dir))

    def save_image_pil_impl(self, glContext: 'moderngl.Context', format:str = ".png"):
        imageName = askstring("Image Name", "Enter Image's Name", initialvalue="No_Name")
        if not imageName:
            # imageName = "No_Name"
            print("Cancelled. Not Saving")
            return

        ftp = os.path.join(self.output_dir, imageName + format)
        
        if format == ".jpg":
            raw_img_data = glContext.screen.read(components=3)
            image = Image.frombytes('RGB', glContext.fbo.size, raw_img_data)
        else:
            raw_img_data = glContext.screen.read(components=4)
            image = Image.frombytes('RGBA', glContext.fbo.size, raw_img_data)

        image = image.transpose(Image.FLIP_TOP_BOTTOM)
        image.save(ftp)
        print("Saved Image {} at: {}".format(imageName, ftp))