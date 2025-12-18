/**
 * Kimi (Moonshot) 对话导出脚本
 * 使用方法: 在 kimi.moonshot.cn 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "Kimi";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "听回答", "搜索", "停止生成", "继续", "Continue", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    const aiMessages = Array.from(document.querySelectorAll('.markdown-body'));
    const userMessages = Array.from(document.querySelectorAll('[class*="user-message"], [class*="UserMessage"], .justify-end [class*="message"], .pop-user-message'));
    
    let tempItems = [];
    aiMessages.forEach(node => tempItems.push({ role: 'Kimi', node, text: node.innerText }));
    userMessages.forEach(node => tempItems.push({ role: 'User', node, text: node.innerText }));
    
    if (tempItems.length < 2) {
        console.log('启用视觉兜底方案...');
        const allDivs = Array.from(document.querySelectorAll('div[class*="content"], div[class*="text"]'))
            .filter(div => div.innerText.length > 5 && !div.querySelector('button'))
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        let isUser = true;
        allDivs.forEach(div => {
            if (!items.some(it => it.text === div.innerText)) {
                items.push({ role: isUser ? 'User' : 'Kimi', text: div.innerText });
                isUser = !isUser;
            }
        });
    } else {
        tempItems.sort((a, b) => a.node.getBoundingClientRect().top - b.node.getBoundingClientRect().top);
        tempItems.forEach(it => {
            if (!items.some(exist => exist.text === it.text)) {
                items.push({ role: it.role, text: it.text });
            }
        });
    }

    // 导出
    if (items.length === 0) {
        alert(`⚠️ 未提取到内容，请确保对话已加载完成`);
        return;
    }

    let finalContent = `${platformName} 对话导出\n导出时间: ${new Date().toLocaleString()}\n共 ${items.length} 条消息\n${"=".repeat(50)}\n\n`;
    let validCount = 0;
    
    items.forEach(item => {
        let text = item.text;
        junkWords.forEach(jw => { text = text.replace(new RegExp(jw, 'g'), ''); });
        text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
        
        if (text.length > 1) {
            validCount++;
            finalContent += `\n【${item.role}】 (#${validCount}):\n${text}\n\n${"-".repeat(50)}\n`;
        }
    });

    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${platformName}_Export_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`✅ 导出成功! 有效消息: ${validCount} 条`);
})();
