
Started Last year, 2023, around November

Comment: Mon-4-March-2024


Comment: Tues-05-March-2024
Added the Heavenly Bodies
Implemented gravitational attraction.
Implemented trail showing by using an alpha surface.
It was not working at first, but then figured that it was because of the window.fill("black"), that covered the trails.


#   Date: Thurs-11-July-2024

    Now, an entity is not a model.
    For example, an Entity can be a chair; but there are different models of a chair.
    Hence, in my implementation, the Entity name is different from the model's name.
    But an Entity is made particular by the 'role' it plays. There can be many entities of the same model, but they differ in what role they perform.


#   Date: Mon-15-July-2024

Learnt that Python does not have function overloading.


#   Date: Wed-11-December-2024

Made some changes:

* Fixed the `class MglSurfaceEntity` so that one can specify if they want to render a texture or not. This involved allowing a user to specify the formats and attributes to be sent to the GPU.

* Added functionality to make the Vertex Buffer dynamic so that Vertex Data can be modified during runtime. This was so that one can choose to add textures later even in runtime

* Fixed the issue that occurs when clearing memory, the one that had to do with clearing the Vertex Memory multiple times.

>   Remember, Moderngl ensures that what you send to the GPU, you use it, else Moderngl will complain.