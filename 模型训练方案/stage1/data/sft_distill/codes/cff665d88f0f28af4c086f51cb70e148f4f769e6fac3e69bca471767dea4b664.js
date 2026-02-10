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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 100, 100); // 100x100 的矩形
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建矩形精灵对象，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放动画
  // 使用 yoyo 实现往返效果：1 -> 0.32 -> 1
  this.tweens.add({
    targets: rect,
    scaleX: 0.32,  // 缩放到 32%
    scaleY: 0.32,  // 缩放到 32%
    duration: 1500, // 单程 1.5 秒
    yoyo: true,     // 自动返回原始值
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '矩形缩放动画（3秒循环）', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);