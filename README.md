# CultsDL

This project exists because I was frustrated with how the downloads work at cults3d.com and decided to invest a lot more hours to build this software than it would have taken me to just download my files. But I got to learn a lot of things from it.

This software effectively acts on your behalf - requesting the orders and items and storing them to be processed in a way that is more useful for me. It also implements various caching and queues to allow downloading all the files and saving images, descriptions and tags.

## Getting the token

Since this acts on your behalf, you need to allow it to use your logged-in session. Cults use a secure token in a cookie called `_session_id`. You need to get that from the Application tab of the inspector. When I say the token is secure I was surprised to find out that cults don't let you retrieve the cookie via javascript!
