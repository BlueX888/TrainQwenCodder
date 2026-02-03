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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形精灵并放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5);

  // 创建缩放动画
  // duration: 1250ms，因为 yoyo 会使动画来回播放，总时长为 2.5 秒
  // yoyo: true 表示动画播放完后反向播放回到初始状态
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut'
  });

  // 添加提示文本
  const text = this.add.text(400, 50, '矩形缩放动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);