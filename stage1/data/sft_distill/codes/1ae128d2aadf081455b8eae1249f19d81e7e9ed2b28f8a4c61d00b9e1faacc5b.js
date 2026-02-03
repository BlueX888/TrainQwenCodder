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
  // 使用 Graphics 绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建使用该纹理的 Sprite
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1000,            // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 来回播放（透明->不透明->透明）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 500, '圆形在 1 秒内从透明渐变到不透明，循环播放', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);