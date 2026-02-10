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
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 在屏幕中央绘制一个 200x150 的矩形
  const rectWidth = 200;
  const rectHeight = 150;
  const rectX = (this.cameras.main.width - rectWidth) / 2;
  const rectY = (this.cameras.main.height - rectHeight) / 2;
  
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 1500,              // 持续时间 1.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: false,                 // 不反向播放
    repeat: -1,                  // 无限循环（-1 表示永久重复）
    repeatDelay: 0               // 重复之间无延迟
  });
  
  // 添加提示文本
  this.add.text(400, 50, '矩形渐变动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);