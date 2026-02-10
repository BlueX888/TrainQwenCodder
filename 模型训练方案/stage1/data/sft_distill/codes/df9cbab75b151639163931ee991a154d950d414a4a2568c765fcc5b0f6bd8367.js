const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形（中心点在屏幕中央）
  // 三角形的三个顶点坐标
  const centerX = 400;
  const centerY = 300;
  const size = 100;
  
  // 计算三角形顶点（顶点朝上的等边三角形）
  const x1 = centerX;
  const y1 = centerY - size;
  const x2 = centerX - size * Math.cos(Math.PI / 6);
  const y2 = centerY + size * Math.sin(Math.PI / 6);
  const x3 = centerX + size * Math.cos(Math.PI / 6);
  const y3 = centerY + size * Math.sin(Math.PI / 6);
  
  graphics.fillTriangle(x1, y1, x2, y2, x3, y3);
  
  // 设置三角形的原点为中心点，便于缩放
  graphics.setPosition(0, 0);
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.48,        // 缩放到 48%
    scaleY: 0.48,        // 缩放到 48%
    duration: 3000,      // 持续时间 3 秒
    yoyo: true,          // 启用 yoyo 效果，动画结束后自动反向播放回到原始状态
    loop: -1,            // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字提示
  this.add.text(400, 50, '三角形缩放动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 48%', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);