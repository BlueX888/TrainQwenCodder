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
  // 使用 Graphics 绘制一个圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100); // 生成 100x100 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建使用圆形纹理的精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  circle.setAlpha(0); // 初始设置为完全透明

  // 创建 Tween 动画：从透明（alpha: 0）到不透明（alpha: 1）
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标 alpha 值（完全不透明）
    duration: 4000,            // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',            // 线性缓动
    repeat: -1,                // -1 表示无限循环
    yoyo: false                // 不需要往返效果，只需要 0 -> 1 循环
  });

  // 添加提示文本
  this.add.text(400, 550, '圆形从透明到不透明循环播放（4秒周期）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);