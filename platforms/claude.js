/**
 * Claude (Anthropic) 对话导出脚本
 * 使用方法: 在 claude.ai 页面的控制台中运行此脚本
 */
(function() {
    const platformName = "Claude";
    console.log(`🚀 ${platformName} 导出脚本启动...`);
    
    const junkWords = ["复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit", "重试", "Retry", "删除", "Delete", "分享", "Share"];
    let items = [];

    // 方案1: data-testid 选择器
    const messages = document.querySelectorAll('[data-testid="user-message"], [data-testid="assistant-message"]');
    
    if (messages.length > 0) {
        console.log(`✅ 方案1成功: 找到 ${messages.length} 条消息`);
        messages.forEach(msg => {
            const isUser = msg.getAttribute('data-testid') === 'user-message';
            const role = isUser ? 'User' : 'Claude';
            items.push({ role, text: msg.innerText });
        });
    } else {
        // 方案2: class 选择器
        const oldMessages = document.querySelectorAll('.font-user-message, .font-claude-message');
        if (oldMessages.length > 0) {
            console.log(`✅ 方案2成功: 找到 ${oldMessages.length} 条消息`);
            oldMessages.forEach(msg => {
                const role = msg.classList.contains('font-user-message') ? 'User' : 'Claude';
                items.push({ role, text: msg.innerText });
            });
        } else {
            // 方案3: 通用检测
            console.log('⚠️ 启用方案3: 通用检测模式...');
            const allContainers = Array.from(document.querySelectorAll('div[class*="message"], div[class*="chat"], div[role="article"]'))
                .filter(el => el.innerText.length > 10);
            
            allContainers.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
            
            let isUserTurn = true;
            const processedTexts = new Set();
            
            allContainers.forEach(container => {
                const text = container.innerText.trim();
                if (processedTexts.has(text)) return;
                processedTexts.add(text);
                
                let role;
                if (container.innerHTML.includes('code') || container.querySelector('pre')) {
                    role = 'Claude';
                } else if (text.length < 100 && !container.querySelector('button')) {
                    role = 'User';
                } else {
                    role = isUserTurn ? 'User' : 'Claude';
                    isUserTurn = !isUserTurn;
                }
                
                items.push({ role, text });
            });
        }
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
