/**
 * 智谱清言 (ChatGLM) 对话导出脚本
 * 使用方法: 在 chatglm.cn 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "ChatGLM";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "GLM", "智谱", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    const bubbles = document.querySelectorAll('.enter-active, .bubble-container, .message-item');
    
    if (bubbles.length > 0) {
        bubbles.forEach(bubble => {
            let role = 'User';
            if (bubble.querySelector('.markdown-body') || bubble.innerHTML.includes('code-block-wrapper')) {
                role = 'ChatGLM';
            }
            items.push({ role, text: bubble.innerText });
        });
    } else {
        let tempItems = [];
        document.querySelectorAll('.markdown-body').forEach(n => tempItems.push({ role: 'ChatGLM', node: n, text: n.innerText }));
        document.querySelectorAll('div[class*="row-reverse"] .bubble-content').forEach(n => tempItems.push({ role: 'User', node: n, text: n.innerText }));
        tempItems.sort((a, b) => (a.node ? a.node.getBoundingClientRect().top : 0) - (b.node ? b.node.getBoundingClientRect().top : 0));
        tempItems.forEach(it => items.push({ role: it.role, text: it.text }));
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
