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
  
  // 设置填充样式为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 在屏幕中心绘制一个 200x150 的矩形
  const rectX = 300;
  const rectY = 225;
  const rectWidth = 200;
  const rectHeight = 150;
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画，让矩形从透明渐变到不透明
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 4000,              // 持续时间 4 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返效果（不透明后再变回透明）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 50, '矩形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '4秒渐变循环播放', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);