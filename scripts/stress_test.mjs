// 简易压力测试脚本 (Simple Stress Test) - 修复版
// 运行命令: node scripts/stress_test.mjs

const TARGET_URL = 'http://localhost:3000/api/works?pageSize=20';
const TOTAL_REQUESTS = 200; // 总请求数
const CONCURRENCY = 20;     // 并发数 (在本地 dev 模式下，建议降到 20，否则 Node 单线程处理不过来会假死)

import { performance } from 'perf_hooks';

async function runTest() {
    console.log(`\n🚀 开始压力测试...`);
    console.log(`目标: ${TARGET_URL}`);
    console.log(`并发用户: ${CONCURRENCY}`);
    console.log(`总请求数: ${TOTAL_REQUESTS}\n`);

    const startTotal = performance.now();

    // 批次发送器
    const batchSize = CONCURRENCY;
    const batches = Math.ceil(TOTAL_REQUESTS / batchSize);

    const finalResults = [];

    for (let i = 0; i < batches; i++) {
        const batchPromises = [];
        // 这一批次只需发多少个
        const currentBatchCount = Math.min(batchSize, TOTAL_REQUESTS - (i * batchSize));

        for (let j = 0; j < currentBatchCount; j++) {
            const start = performance.now();
            batchPromises.push(
                fetch(TARGET_URL)
                    .then(async res => {
                        if (res.ok) {
                            await res.json(); // 确保读完数据
                        }
                        return { success: res.ok, duration: performance.now() - start, status: res.status };
                    })
                    .catch(e => ({ success: false, duration: performance.now() - start, status: 'NET_ERR' }))
            );
        }

        process.stdout.write(`Batch ${i + 1}/${batches} (sending ${currentBatchCount} reqs)... `);
        const batchResults = await Promise.all(batchPromises);
        finalResults.push(...batchResults);
        console.log(`Done.`);

        // 稍微休息一下，模拟真实用户的间隔，避免本地电脑卡死
        if (i < batches - 1) await new Promise(r => setTimeout(r, 500));
    }

    const endTotal = performance.now();
    const durationTotal = (endTotal - startTotal) / 1000;

    // 统计报告
    const successCount = finalResults.filter(r => r.success).length;
    const failCount = finalResults.length - successCount;

    // 计算延迟
    const avgTime = finalResults.reduce((acc, r) => acc + r.duration, 0) / finalResults.length;
    const sortedDurations = finalResults.map(r => r.duration).sort((a, b) => a - b);
    const minTime = sortedDurations[0];
    const maxTime = sortedDurations[sortedDurations.length - 1];
    const p95Time = sortedDurations[Math.floor(sortedDurations.length * 0.95)];

    console.log(`\n\n📊 测试报告 (修复版)`);
    console.log(`=========================`);
    console.log(`总耗时: ${durationTotal.toFixed(2)} 秒`);
    console.log(`实际 RPS: ${(TOTAL_REQUESTS / durationTotal).toFixed(2)}`);
    console.log(`-------------------------`);
    console.log(`成功: ${successCount} ✅`);
    console.log(`失败: ${failCount} ❌`);
    console.log(`-------------------------`);
    console.log(`平均延迟: ${avgTime.toFixed(0)} ms`);
    console.log(`最小延迟: ${minTime.toFixed(0)} ms`);
    console.log(`最大延迟: ${maxTime.toFixed(0)} ms`);
    console.log(`95%请求在: ${p95Time.toFixed(0)} ms 以内`);

    if (failCount === 0) {
        console.log(`\n🎉  完美通过！`);
    } else {
        console.log(`\n⚠️  不管有什么错误，请检查上面的 status code。`);
    }
}

runTest();
