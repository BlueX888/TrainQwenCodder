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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 绘制半径为 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建使用该纹理的精灵对象，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);

  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: circle,           // 目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1000,            // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返播放（透明→不透明→透明）
    repeat: -1                 // 无限循环（-1 表示永远重复）
  });
}

new Phaser.Game(config);