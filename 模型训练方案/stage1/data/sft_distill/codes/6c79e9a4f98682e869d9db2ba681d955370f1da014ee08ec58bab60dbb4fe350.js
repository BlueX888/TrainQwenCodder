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
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4488ff, 1);
  
  // 在屏幕中心绘制一个 200x150 的矩形
  const rectX = 300;
  const rectY = 225;
  const rectWidth = 200;
  const rectHeight = 150;
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建补间动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1,                // 目标透明度为 1（完全不透明）
    duration: 1500,          // 持续时间 1.5 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 往返播放（不透明后再回到透明）
    loop: -1,                // 无限循环
    repeat: 0                // yoyo 模式下不需要额外 repeat
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

new Phaser.Game(config);