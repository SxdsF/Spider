//依赖模块
    let request = require("request");
    let cheerio = require("cheerio");
    let mongoose = require("mongoose");
    mongoose.connect('mongodb://localhost/modelshow'); //创建一个数据库连接
    let ModelInfo = mongoose.model('ModelInfo',{
        title      : String,
        description: String,
        cover      : String,
        images     : [String],
        createDate : {type: Date, default: Date.now}
    });
     
    //目标网址
    let url = 'http://www.tysj010.com/forum.php';

    //链接前缀
    let prefix = 'http://www.tysj010.com/';

    let count = 0;
     
    //发送请求
    function modelList(url){
        request(url,function(error, response, body) {
                if(!error && response.statusCode == 200) {
                    let $ = cheerio.load(body);
                    //读取下一页
                    let nxt = $('.nxt');
                    if(nxt){
                        nxt.each(function(element){
                            if(nxt[element].name === 'a'){
                                modelList(`${prefix}${nxt[element].attribs.href}`);
                            }
                        });
                    }
                    //读取model的详细信息
                    let z = $('.z');
                    z.each(function(element){
                        if(z[element].name === 'a'){
                            modeldetails(`${prefix}${z[element].attribs.href}`);
                        }
                    });
                }
            });
    }

    function modeldetails(url){
        request(url,function(err,res,body){
            if(!err && res.statusCode == 200) {
                let modelInfo = new ModelInfo();
                let $ = cheerio.load(body);
                let t_f = $('.t_f');
                modelInfo.description = t_f[0].children[0].data;
                modelInfo.title = modelInfo.description;
                modelInfo.images = [];
                let zoom = $('.zoom');
                zoom.each(function(element){
                    if(zoom[element].name === 'img'){
                        modelInfo.images.push(prefix + zoom[element].attribs.file);
                    }
                });
                modelInfo.cover = modelInfo.images[0];
                modelInfo.createDate = new Date();
                modelInfo.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(++count);
                    }
                });
            }
        });
    }

    modelList({
                method: 'GET',
                uri: url,
                qs: {
                    mod: 'forumdisplay',
                    fid: 46
                },
            });
