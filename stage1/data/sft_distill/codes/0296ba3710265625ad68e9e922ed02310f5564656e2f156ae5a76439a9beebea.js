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
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('purpleSquare', 100, 100);
  graphics.destroy();

  // 创建紫色方块精灵，放置在屏幕中心
  const square = this.add.sprite(400, 300, 'purpleSquare');

  // 创建淡入淡出动画
  // 4秒完成一次完整的淡入淡出循环
  // yoyo: true 表示动画会反向播放（淡入后淡出）
  // repeat: -1 表示无限循环
  this.tweens.add({
    targets: square,
    alpha: 0,           // 目标透明度为0（完全透明）
    duration: 2000,     // 单向动画持续2秒
    yoyo: true,         // 启用往返效果（淡出后再淡入）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动函数，使动画更平滑
  });

  // 添加文字说明
  this.add.text(400, 500, 'Purple Square Fade In/Out Animation', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);