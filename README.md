# CultsDL

This project exists because I was frustrated with how the downloads work at cults3d.com and decided to invest a lot more hours to build this software than it would have taken me to download my files. But I got to learn a lot of things from it.

This software effectively acts on your behalf - requesting the orders and items and storing them to be processed in a way that is more useful for me. It also implements various caching and queues to download files and save images, descriptions and tags.

## Getting the token

Since this works for you, you must allow it to use your logged-in session. You do need an active logged-in session; this software does not enable bypassing any security or access policies of the site. It can act as you and see and get files you can access only.

Cults use a secure token in a cookie called `_session_id`. You need to get that from the inspector's application tab.
