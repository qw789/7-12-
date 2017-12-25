var express = require('express');
var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

var app = express();

app.get('/', function(req, res, next) {
    superagent.get(cnodeUrl)
        .end(function(err, ele) {
            if (err) {
                return console.error(err);
            }
            var topicUrls = [];
            var $ = cheerio.load(ele.text);
            // 获取首页所有的链接
            $('#topic_list .topic_title').each(function(idx, element) {
                var $element = $(element);
                // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
                // 我们用 url.resolve 来自动推断出完整 url，变成
                // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
                // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
                var href = url.resolve(cnodeUrl, $element.attr('href'));
                topicUrls.push(href);
            });

            var ep = new eventproxy();
            //注册
            ep.after('topic_html', topicUrls.length, function(topics) {
                // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair

                // 开始行动
                topics = topics.map(function(topicPair) {
                    // 接下来都是 jquery 的用法了
                    var topicUrl = topicPair[0];
                    var topicHtml = topicPair[1];
                    var $ = cheerio.load(topicHtml);
                    return ({
                        title: $('.topic_full_title').text().trim(),
                        href: topicUrl,
                        comment1: $('.reply_content').eq(0).text().trim(),
                    });
                });

                console.log('final:');
                console.log(topics);
            });
            topicUrls.forEach(function(topicUrl) {
                superagent.get(topicUrl)
                    .end(function(err, res) {
                        console.log('fetch ' + topicUrl + ' successful');
                        //触发
                        ep.emit('topic_html', [topicUrl, res.text]);
                    });
            });
        });
});
app.listen(3000, function() {
    console.log('app is listening at port 3000');
});