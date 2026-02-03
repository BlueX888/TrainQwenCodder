const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 在中心位置绘制一个半径为 80 的圆形
  const centerX = 400;
  const centerY = 300;
  const radius = 80;
  graphics.fillCircle(centerX, centerY, radius);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，持续 1 秒，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 1000,              // 持续时间 1 秒
    ease: 'Linear',              // 线性渐变
    yoyo: true,                  // 反向播放（不透明再回到透明）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);