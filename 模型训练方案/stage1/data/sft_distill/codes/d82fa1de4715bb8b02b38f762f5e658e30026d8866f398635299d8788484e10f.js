const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形的中心点和大小
  const centerX = 400;
  const centerY = 300;
  const size = 100;
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size); // 上顶点
  graphics.lineTo(centerX + size, centerY); // 右顶点
  graphics.lineTo(centerX, centerY + size); // 下顶点
  graphics.lineTo(centerX - size, centerY); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始透明度为 0（完全透明）
  graphics.alpha = 0;
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,
    alpha: 1, // 目标透明度：完全不透明
    duration: 1500, // 持续时间 1.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返播放（从 0 到 1 再从 1 到 0）
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 50, '菱形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);