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
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（使用鲜艳的颜色以便观察透明度变化）
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（使用四个顶点）
  // 中心点在 (400, 300)，菱形宽高各 200 像素
  const centerX = 400;
  const centerY = 300;
  const size = 100;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 3000,              // 持续时间 3 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返播放（不透明后再回到透明）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '菱形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);