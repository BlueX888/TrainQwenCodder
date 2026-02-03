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
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充样式为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个居中的矩形（200x150）
  const rectX = 300;
  const rectY = 225;
  const rectWidth = 200;
  const rectHeight = 150;
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建渐变动画：从透明（alpha: 0）到不透明（alpha: 1）
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值
    duration: 2000,              // 持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    loop: -1,                    // 无限循环
    yoyo: true                   // 来回播放（透明->不透明->透明）
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Rectangle Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Alpha: 0 → 1 (2 seconds, looping)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);