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
  // 使用 Graphics 绘制一个圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100); // 生成 100x100 的纹理
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成

  // 创建一个使用圆形纹理的 Sprite，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  circle.setAlpha(0); // 初始设置为完全透明

  // 创建 Tween 动画：从透明到不透明，持续 4 秒，循环播放
  this.tweens.add({
    targets: circle,        // 动画目标对象
    alpha: 1,               // 目标 alpha 值（完全不透明）
    duration: 4000,         // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',         // 线性缓动
    yoyo: true,             // 启用 yoyo 效果（到达目标后反向播放）
    repeat: -1              // 无限循环（-1 表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 500, 'Circle fading in/out (4s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);