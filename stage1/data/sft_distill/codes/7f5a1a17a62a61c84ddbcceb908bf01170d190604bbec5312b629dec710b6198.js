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
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('pinkRect', 200, 150);
  graphics.destroy();

  // 创建粉色矩形精灵，放置在屏幕中央
  const pinkRect = this.add.sprite(400, 300, 'pinkRect');

  // 创建闪烁动画
  // 使用 alpha 透明度从 1 渐变到 0，再回到 1，完成一次闪烁
  this.tweens.add({
    targets: pinkRect,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1500,     // 单程 1.5 秒
    yoyo: true,         // 来回播放（0->1 再 1->0）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动函数，使闪烁更平滑
  });

  // 添加提示文本
  this.add.text(400, 500, '粉色矩形闪烁动画（3秒一次循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);