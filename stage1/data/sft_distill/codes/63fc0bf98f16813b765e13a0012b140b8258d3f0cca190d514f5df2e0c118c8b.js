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
  // 使用 Graphics 绘制一个矩形
  const graphics = this.add.graphics();
  
  // 设置填充样式（蓝色矩形）
  graphics.fillStyle(0x3498db, 1);
  
  // 在屏幕中心绘制一个 200x150 的矩形
  const rectX = (this.cameras.main.width - 200) / 2;
  const rectY = (this.cameras.main.height - 150) / 2;
  graphics.fillRect(rectX, rectY, 200, 150);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明（alpha: 0）到不透明（alpha: 1）
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值
    duration: 1500,              // 持续时间 1.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 反向播放（1 -> 0）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '矩形渐变动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '透明 ↔ 不透明 (1.5秒循环)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);