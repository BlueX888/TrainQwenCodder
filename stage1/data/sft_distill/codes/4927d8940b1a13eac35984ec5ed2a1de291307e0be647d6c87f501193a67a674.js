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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('rectTexture', 200, 150);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建使用该纹理的图像对象，放置在屏幕中心
  const rect = this.add.image(400, 300, 'rectTexture');
  
  // 设置初始透明度为 0（完全透明）
  rect.setAlpha(0);

  // 创建 Tween 动画：从透明（alpha=0）到不透明（alpha=1）
  this.tweens.add({
    targets: rect,           // 动画目标对象
    alpha: 1,                // 目标透明度值
    duration: 1000,          // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 来回播放（渐显后渐隐）
    repeat: -1               // 无限循环（-1 表示永久重复）
  });

  // 添加提示文本
  this.add.text(400, 50, 'Rectangle Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);