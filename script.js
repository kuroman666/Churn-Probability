// 初始化 Chart.js 圖表實例
let churnChartInstance = null;

/**
 * 點擊「執行 AI 預測」按鈕時觸發
 */
function predictChurn() {
    // 1. 獲取表單數據 (這裡模擬將數據打包成 JSON)
    const formData = {
        creditScore: parseInt(document.getElementById('creditScore').value),
        geography: document.getElementById('geography').value,
        gender: document.getElementById('gender').value,
        age: parseInt(document.getElementById('age').value),
        balance: parseFloat(document.getElementById('balance').value),
        active: document.getElementById('isActiveMember').checked
    };

    // 2. 模擬後端 AI 模型邏輯 (Mock Logic)
    // 這裡寫一個簡單的規則來產生「假」的預測結果，讓介面有反應
    let mockProbability = 0.2; // 基礎機率 20%

    // 簡單規則：年紀大、餘額高、德國人、不活躍 -> 流失率高
    if (formData.geography === 'Germany') mockProbability += 0.15;
    if (formData.age > 50) mockProbability += 0.2;
    else if (formData.age > 40) mockProbability += 0.1;
    if (!formData.active) mockProbability += 0.15;
    if (formData.balance > 100000) mockProbability += 0.1;
    
    // 確保機率在 0~1 之間 (稍微隨機化一點)
    mockProbability += (Math.random() * 0.1 - 0.05); 
    mockProbability = Math.min(Math.max(mockProbability, 0.05), 0.98);

    // 3. 更新 UI
    updateUI(mockProbability, formData);
}

/**
 * 根據預測結果更新網頁內容
 * @param {number} probability - 流失機率 (0~1)
 * @param {object} data - 使用者輸入的資料
 */
function updateUI(probability, data) {
    const resultSection = document.getElementById('resultSection');
    const probValue = document.getElementById('probValue');
    const riskBadge = document.getElementById('riskBadge');
    const factorsList = document.getElementById('factorsList');
    const suggestionText = document.getElementById('suggestionText');

    // 顯示結果區塊
    resultSection.classList.add('active');

    // 格式化數值
    const percentage = (probability * 100).toFixed(1);
    probValue.innerText = `${percentage}%`;

    // 設定風險等級樣式
    if (probability > 0.5) {
        riskBadge.className = 'risk-badge risk-high';
        riskBadge.innerText = '高風險 High Risk';
        probValue.style.background = 'linear-gradient(90deg, #f87171, #ef4444)';
        probValue.style.webkitBackgroundClip = 'text';
        
        suggestionText.innerText = "客戶流失風險極高！建議立即指派專員聯繫，並提供「高資產客戶專屬優惠」或「手續費減免」方案以提升黏著度。";
    } else {
        riskBadge.className = 'risk-badge risk-low';
        riskBadge.innerText = '低風險 Low Risk';
        probValue.style.background = 'linear-gradient(90deg, #34d399, #10b981)';
        probValue.style.webkitBackgroundClip = 'text';

        suggestionText.innerText = "客戶狀態穩定。建議維持定期電子報互動，並推薦適合的理財產品以加深關係。";
    }

    // 更新圖表 (使用 Chart.js)
    updateChart(probability);

    // 模擬 XAI 關鍵因子 (根據輸入特徵動態生成)
    let factorsHtml = '';
    if (data.geography === 'Germany') {
        factorsHtml += `<li class="factor-item"><span class="factor-name">地理位置 (Germany)</span> <span class="factor-impact text-danger"><i class="fa-solid fa-arrow-trend-up"></i> 增加風險</span></li>`;
    }
    if (data.age > 45) {
        factorsHtml += `<li class="factor-item"><span class="factor-name">年齡 (${data.age})</span> <span class="factor-impact text-danger"><i class="fa-solid fa-arrow-trend-up"></i> 增加風險</span></li>`;
    }
    if (!data.active) {
        factorsHtml += `<li class="factor-item"><span class="factor-name">活躍狀態 (Inactive)</span> <span class="factor-impact text-danger"><i class="fa-solid fa-arrow-trend-up"></i> 增加風險</span></li>`;
    }
    if (data.active) {
        factorsHtml += `<li class="factor-item"><span class="factor-name">活躍狀態 (Active)</span> <span class="factor-impact" style="color:var(--success)"><i class="fa-solid fa-arrow-trend-down"></i> 降低風險</span></li>`;
    }
    
    // 補一個通用的
    factorsHtml += `<li class="factor-item"><span class="factor-name">持有產品數</span> <span class="factor-impact" style="color:#94a3b8">影響輕微</span></li>`;

    factorsList.innerHTML = factorsHtml;
}

/**
 * 繪製或更新甜甜圈圖表
 * @param {number} probability - 流失機率
 */
function updateChart(probability) {
    const ctx = document.getElementById('churnChart').getContext('2d');
    const remain = 1 - probability;

    if (churnChartInstance) {
        churnChartInstance.destroy();
    }

    churnChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['流失機率', '留存機率'],
            datasets: [{
                data: [probability, remain],
                backgroundColor: [
                    probability > 0.5 ? '#ef4444' : '#10b981', // 紅色或綠色
                    '#334155' // 深灰底色
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // 讓甜甜圈變細
            plugins: {
                legend: { display: false }
            }
        }
    });
}



