MEAN-mongoose-demo
==================

1. mongoosepm
a demo from the book'Mongoose for Application Development'

2. mongoose-update
a demo of dtree:update json,mongoose schema,subdocs...

usage:
>npm install
>node app
>URL: localhost:3000

function:
![alt](http://edwardsblog.qiniudn.com/image/8/64/f28ccd73b1ed657ac64cef7476199.JPG)

1.click 添加dtree到数据库
new_structure.json->js Object -> create MongoDB

2.click 将数据库中的node反序列化
MongoDB->js Object -> write testjson/trees.json

3.click 将node序列化存入数据库
trees.json->js Object -> update MongoDB

相关博客文章
[NodeJS:树的反序列化](http://www.edwardesire.com/nodejs-serialize-dtree/)
[NodeJS:树的序列化](http://www.edwardesire.com/nodejs-deserialize-dtree/)
