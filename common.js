/**
 * AI Chat Exporter - 公共工具函数
 * 用于各平台导出脚本的通用功能
 */

// 需要过滤的UI元素文本
const junkWords = [
    "复制", "Copy", "Regenerate", "重新生成", "编辑", "Edit",
    "听回答", "Show drafts", "搜索", "停止生成", "继续", "Continue",
    "Was this response better?", "Enter to send", "Copy code",
    "4o", "Thinking Process", "豆包", "Doubao", "GLM", "智谱",
    "重试", "Retry", "删除", "Delete", "分享", "Share",
    "点赞", "赞", "踩", "收藏", "Favorite", "Read aloud"
];

/**
 * 清理文本内容
 * @param {string} text - 原始文本
 * @returns {string} - 清理后的文本
 */
function cleanText(text) {
    if (!text) return '';
    
    let cleaned = text;
    junkWords.forEach(jw => {
        const regex = new RegExp(jw, 'g');
        cleaned = cleaned.replace(regex, '');
    });
    
    // 清理多余空行
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    return cleaned;
}

/**
 * 导出对话内容到文件
 * @param {Array} items - 消息数组 [{role, text}, ...]
 * @param {string} platformName - 平台名称
 */
function exportToFile(items, platformName) {
    if (items.length === 0) {
        alert(`⚠️ 在 [${platformName}] 未提取到内容!\n\n请尝试:\n1. 滚动页面到最底部\n2. 等待页面完全加载\n3. 刷新页面后重试`);
        return;
    }

    console.log(`📊 原始提取: ${items.length} 条消息`);
    
    let finalContent = `${platformName} 对话导出\n导出时间: ${new Date().toLocaleString()}\n共 ${items.length} 条消息\n${"=".repeat(50)}\n\n`;
    
    let validCount = 0;
    items.forEach((item) => {
        let text = cleanText(item.text);
        
        if (text.length > 1) {
            validCount++;
            finalContent += `\n【${item.role}】 (#${validCount}):\n${text}\n\n${"-".repeat(50)}\n`;
        }
    });

    // 创建下载
    const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${platformName.replace(/\s+/g, '_')}_Export_${new Date().toISOString().slice(0,10)}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`✅ [${platformName}] 导出完成!`);
    console.log(`📈 统计: 原始${items.length}条 → 有效${validCount}条`);
    
    alert(`✅ 导出成功!\n\n平台: ${platformName}\n有效消息: ${validCount} 条\n文件已保存到下载文件夹`);
}
