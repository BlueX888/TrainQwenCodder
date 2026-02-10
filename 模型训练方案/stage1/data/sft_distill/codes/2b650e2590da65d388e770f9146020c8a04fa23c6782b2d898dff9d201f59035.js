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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100); // 生成 100x100 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);

  // 创建 Tween 动画：从透明到不透明，持续 2 秒，循环播放
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度为 1（完全不透明）
    duration: 2000,            // 持续时间 2 秒（2000 毫秒）
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 来回播放（透明->不透明->透明）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 50, 'Circle Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);