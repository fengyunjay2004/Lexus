if ($request) {
    let body = $request.body;  // 获取请求体
    let url = $request.url;

    // 定义10分钟的毫秒数
    const TEN_MINUTES = 10 * 60 * 1000;

    // 获取当前时间
    let currentTime = new Date().getTime();

    // 从本地缓存中获取油价列表和对应的时间戳
    let cachedPrices = JSON.parse($prefs.valueForKey("priceList") || "[]");  // 获取油价列表，默认空数组
    let lastSavedTime = $prefs.valueForKey("priceTime");

    // 清理过期的油价数据
    cachedPrices = cachedPrices.filter(item => currentTime - item.timestamp < TEN_MINUTES);

    // 更新缓存
    $prefs.setValueForKey(JSON.stringify(cachedPrices), "priceList");
    $prefs.setValueForKey(currentTime, "priceTime");

    // 检查是否为获取油价的请求
    if (url.indexOf("http://www.qiyoujiage.com/shanghai.shtml") !== -1) {
        // 提取网页中的油价信息
        let priceMatch = body.match(/<div class="time">([^<]+)<\/div>\s*<span class="price">([^<]+)<\/span>/g);

        if (priceMatch) {
            let prices = [];
            priceMatch.forEach(match => {
                let dateMatch = match.match(/<div class="time">([^<]+)<\/div>/);
                let priceMatch = match.match(/<span class="price">([^<]+)<\/span>/);
                
                if (dateMatch && priceMatch) {
                    let date = dateMatch[1].trim();
                    let price = priceMatch[1].trim();
                    prices.push({ date, price });
                }
            });

            // 获取今天、昨天和明天的日期
            const today = new Date();
            const yesterday = new Date(today);
            const tomorrow = new Date(today);

            yesterday.setDate(today.getDate() - 1);
            tomorrow.setDate(today.getDate() + 1);

            const dateFormat = (date) => {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}-${month}-${day}`;
            };

            const todayStr = dateFormat(today);
            const yesterdayStr = dateFormat(yesterday);
            const tomorrowStr = dateFormat(tomorrow);

            // 筛选出今天、昨天、明天的油价
            let message = "油价通知：\n";
            prices.forEach(item => {
                if (item.date === todayStr || item.date === yesterdayStr || item.date === tomorrowStr) {
                    message += `${item.date}：${item.price}\n`;
                }
            });

            // 发送通知
            if (message !== "油价通知：\n") {
                sendOilPriceNotification(message);
            } else {
                $notify("油价通知", "", "没有找到相关日期的油价");
                $done();
            }
        } else {
            $notify("失败", "未找到油价信息", "请检查请求体");
            $done();  // 未找到油价时调用 $done()
        }
    } else {
        $done();  // URL 不匹配时调用 $done()
    }
}

// 函数用于发送油价通知消息
function sendOilPriceNotification(message) {
    let wechatWebhookUrl = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=284b000b-784b-40b4-8a4a-893f4ab3b4b8";
    let wechatMessage = {
        "msgtype": "text",
        "text": {
            "content": message
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
        console.log(`油价通知发送成功: ${response.body}`);
        $done();  // 完成
    }, reason => {
        console.log(`油价通知发送失败: ${reason.error}`);
        $done();  // 在消息发送失败后调用 $done()
    });
}
