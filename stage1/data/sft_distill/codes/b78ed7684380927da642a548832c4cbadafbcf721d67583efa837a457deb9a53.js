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
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形精灵并居中显示
  const rect = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放动画
  // yoyo: true 表示动画完成后反向播放（从80%回到100%）
  // loop: -1 表示无限循环
  // duration: 1500 表示单程动画时长1.5秒（完整一个循环是3秒）
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1500,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut'
  });
}

new Phaser.Game(config);