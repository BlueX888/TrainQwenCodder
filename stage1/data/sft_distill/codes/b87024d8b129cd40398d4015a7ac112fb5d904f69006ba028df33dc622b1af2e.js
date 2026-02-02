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

  // 创建精灵对象，放置在屏幕中央
  const pinkSprite = this.add.sprite(400, 300, 'pinkRect');

  // 创建闪烁动画效果
  // 使用 yoyo 实现从 1 到 0 再回到 1 的效果
  this.tweens.add({
    targets: pinkSprite,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 1500, // 1.5 秒变为透明
    yoyo: true, // 反向播放，再回到 alpha = 1
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使闪烁更平滑
  });

  // 添加说明文字
  this.add.text(400, 500, '粉色矩形闪烁动画（3秒一次循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);