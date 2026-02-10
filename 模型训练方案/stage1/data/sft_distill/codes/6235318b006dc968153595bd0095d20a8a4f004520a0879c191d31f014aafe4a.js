const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (60, 60)，边长约 100
  graphics.beginPath();
  graphics.moveTo(60, 10);           // 顶点
  graphics.lineTo(10, 110);          // 左下角
  graphics.lineTo(110, 110);         // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 120, 120);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    scaleX: 0.48,               // X 轴缩放到 48%
    scaleY: 0.48,               // Y 轴缩放到 48%
    duration: 2000,             // 单程持续 2 秒
    yoyo: true,                 // 启用往返效果（缩小后自动恢复）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 550, '三角形缩放动画 (4秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);