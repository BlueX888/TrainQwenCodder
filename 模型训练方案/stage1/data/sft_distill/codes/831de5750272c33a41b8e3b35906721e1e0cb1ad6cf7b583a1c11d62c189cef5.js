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
  // 使用 Graphics 绘制粉色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('pinkRect', 200, 150);
  graphics.destroy();

  // 创建粉色矩形精灵，放置在屏幕中央
  const pinkRect = this.add.sprite(400, 300, 'pinkRect');

  // 创建闪烁动画：透明度从 1 -> 0 -> 1，持续 3 秒，无限循环
  this.tweens.add({
    targets: pinkRect,
    alpha: { from: 1, to: 0 },
    duration: 1500, // 1.5秒淡出
    yoyo: true, // 自动反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });

  // 添加提示文本
  this.add.text(400, 500, 'Pink Rectangle Blinking (3s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);