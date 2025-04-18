const $ = new Env('浙江油价监控');

// 主函数
!(async () => {
  try {
    $.log(`开始执行浙江油价监控脚本 - ${new Date().toLocaleString()}`);
    
    // 发送 GET 请求
    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Proxy-Connection': 'keep-alive',
      'Referer': 'http://www.qiyoujiage.com/zhejiang.shtml',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    };
    
    $.log("正在请求油价网站...");
    const response = await $.http.get({
      url: 'http://www.qiyoujiage.com/zhejiang.shtml',
      headers: headers
    });
    
    $.log(`网站响应状态: ${response.response.statusCode}`);
    
    // 解析网页内容
    const html = response.body;
    $.log(`获取到网页内容，长度: ${html.length} 字符`);
    
    // 输出网页内容的一部分用于调试
    $.log(`网页内容预览(前300字符): ${html.substring(0, 300)}...`);
    
    // 保存原始HTML到文件(如果Surge支持)
    try {
      $persistentStore.write(html, "debug_html");
      $.log("已保存原始HTML到持久化存储");
    } catch (e) {
      $.log(`保存HTML失败: ${e.message}`);
    }
    
    // 尝试多种选择器
    $.log("开始尝试提取内容...");
    let youjiaCont = getElementBySelector(html, '#youjiaCont > div:nth-child(2)');
    
    if (!youjiaCont) {
      $.log("第一个选择器失败，尝试备选选择器...");
      youjiaCont = getElementBySelector(html, '#youjiaCont div');
    }
    
    if (!youjiaCont) {
      $.log("备选选择器也失败，尝试直接搜索关键内容...");
      // 尝试直接通过关键词找到相关内容
      const keywordMatch = html.match(/\d{1,2}月\d{1,2}日[^<]*汽油/);
      if (keywordMatch) {
        youjiaCont = keywordMatch[0];
        $.log(`通过关键词匹配找到内容: ${youjiaCont}`);
      }
    }
    
    if (youjiaCont) {
      $.log(`成功提取内容: ${youjiaCont}`);
      
      // 提取内容文本
      const contentText = youjiaCont.replace(/<[^>]+>/g, '').trim();
      $.log(`清理后的内容文本: ${contentText}`);
      
      // 使用正则表达式提取日期（例如 "4月17日"）
      const datePattern = /(\d{1,2}月\d{1,2}日)/;
      const dateMatch = contentText.match(datePattern);
      
      if (dateMatch) {
        const extractedDateStr = dateMatch[1];
        $.log(`提取到的日期: ${extractedDateStr}`);
        
        // 获取今天日期并格式化为 "4月18日"（去除前导零）
        const today = new Date();
        const todayStr = formatDate(today);
        
        // 计算昨天和明天的日期
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);
        
        $.log(`今天日期: ${todayStr}, 昨天: ${yesterdayStr}, 明天: ${tomorrowStr}`);
        
        // 判断提取的日期是否是昨天、今天或明天
        let message = null;
        if (extractedDateStr === todayStr) {
          message = `今日浙江油价消息: ${contentText}`;
          $.log(`今天的消息: ${message}`);
        } else if (extractedDateStr === yesterdayStr) {
          message = `昨日浙江油价消息: ${contentText}`;
          $.log(`昨天的消息: ${message}`);
        } else if (extractedDateStr === tomorrowStr) {
          message = `明日浙江油价消息: ${contentText}`;
          $.log(`明天的消息: ${message}`);
        } else {
          $.log(`提取的日期(${extractedDateStr})与今天相差超过一天，不发送通知。`);
        }
        
        // 如果有消息，发送Surge通知
        if (message) {
          $.notify("浙江油价监控", "", message);
        }
      } else {
        $.log(`在内容中未找到符合 ${datePattern} 格式的日期`);
        // 输出内容的每个字符及其编码，帮助检查格式问题
        $.log("内容字符分析:");
        for (let i = 0; i < contentText.length && i < 50; i++) {
          const char = contentText[i];
          const code = char.charCodeAt(0);
          $.log(`位置 ${i}: "${char}" (Unicode: ${code})`);
        }
        
        const errorMsg = "未找到日期信息！内容可能格式有变更";
        $.notify("浙江油价监控", "错误", errorMsg);
      }
    } else {
      $.log("分析HTML内容结构:");
      // 尝试找出页面的主要区块
      const mainBlocks = html.match(/<div[^>]*class="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      if (mainBlocks) {
        $.log(`找到 ${mainBlocks.length} 个可能的主内容块`);
      } else {
        $.log("未找到主内容块");
      }
      
      const errorMsg = "没有找到匹配的内容！网站结构可能已变更";
      $.notify("浙江油价监控", "错误", errorMsg);
    }
  } catch (e) {
    $.log(`执行过程中发生错误: ${e.message}`);
    $.log(`错误堆栈: ${e.stack}`);
    $.notify("浙江油价监控", "错误", `运行时出错: ${e.message}`);
  } finally {
    $.log("脚本执行完成");
    $.done();
  }
})();

// 工具函数：格式化日期为 "4月18日" 格式（去除前导零）
function formatDate(date) {
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  return `${month}月${day}日`;
}

// 改进的选择器解析函数，增加更多调试信息
function getElementBySelector(html, selector) {
  $.log(`尝试使用选择器: ${selector}`);
  
  // 分解选择器
  const parts = selector.split('>');
  const firstPart = parts[0].trim();
  
  // 检查是否为ID选择器
  if (firstPart.startsWith('#')) {
    const idName = firstPart.substring(1);
    $.log(`查找ID为 ${idName} 的元素`);
    
    const idRegex = new RegExp(`<[^>]*id=["']${idName}["'][^>]*>([\\s\\S]*?)<\\/div>`, 'i');
    const match = html.match(idRegex);
    
    if (match) {
      $.log(`找到ID为 ${idName} 的元素`);
      
      if (parts.length > 1) {
        $.log(`尝试在其中查找子元素: ${parts[1].trim()}`);
        // 这里简化处理，实际上需要更复杂的DOM解析
        const childRegex = /<div[\s\S]*?>([\s\S]*?)<\/div>/i;
        const childMatch = match[1].match(childRegex);
        
        if (childMatch) {
          $.log("找到匹配的子元素");
          return childMatch[1];
        } else {
          $.log("未找到匹配的子元素");
          return null;
        }
      } else {
        return match[1];
      }
    } else {
      $.log(`未找到ID为 ${idName} 的元素`);
      return null;
    }
  } else {
    $.log("不支持的选择器类型，仅支持简单的ID和子元素选择");
    return null;
  }
}

// Surge 环境模拟
function Env(name) {
  this.name = name;
  
  this.log = (msg) => {
    console.log(`[${name}] ${msg}`);
    // 将日志保存到持久化存储
    try {
      const existingLogs = $persistentStore.read("debug_logs") || "";
      const timestamp = new Date().toLocaleTimeString();
      const newLog = `${timestamp}: ${msg}\n`;
      $persistentStore.write(existingLogs + newLog, "debug_logs");
    } catch (e) {
      console.log(`保存日志失败: ${e.message}`);
    }
  };
  
  this.notify = (title, subtitle, message) => {
    $notification.post(title, subtitle, message);
    this.log(`通知: ${title} ${subtitle} ${message}`);
  };
  
  this.http = {
    get: async (options) => {
      return new Promise((resolve, reject) => {
        $httpClient.get(options, (error, response, body) => {
          if (error) {
            this.log(`HTTP请求失败: ${error}`);
            reject(error);
          } else {
            this.log(`HTTP请求成功，状态码: ${response.statusCode}`);
            resolve({response, body});
          }
        });
      });
    }
  };
  
  this.done = () => {
    this.log("脚本执行结束");
    $done({});
  };
}
