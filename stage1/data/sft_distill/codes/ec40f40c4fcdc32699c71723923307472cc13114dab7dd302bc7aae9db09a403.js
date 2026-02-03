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
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(100, 75, 200, 150); // 绘制椭圆（中心x, 中心y, 宽度, 高度）
  graphics.generateTexture('ellipse', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理

  // 创建椭圆精灵并设置到屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  ellipse.setAlpha(0); // 初始设置为完全透明

  // 创建渐变动画
  this.tweens.add({
    targets: ellipse,
    alpha: 1, // 目标透明度为1（完全不透明）
    duration: 2000, // 持续时间2秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返播放（透明->不透明->透明）
    repeat: -1 // 无限循环
  });

  // 添加文字说明
  this.add.text(400, 500, '椭圆从透明到不透明循环渐变', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);