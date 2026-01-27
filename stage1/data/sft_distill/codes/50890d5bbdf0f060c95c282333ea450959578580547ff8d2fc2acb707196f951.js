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
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建 Sprite 使用生成的纹理
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，4 秒循环播放
  this.tweens.add({
    targets: circle,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 4000, // 持续时间 4 秒
    ease: 'Linear', // 线性缓动
    yoyo: false, // 不反向播放
    loop: -1 // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Circle fading in (4s loop)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);