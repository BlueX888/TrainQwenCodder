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
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('purpleSquare', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建紫色方块精灵，放置在屏幕中央
  const square = this.add.sprite(400, 300, 'purpleSquare');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入淡出效果（从1到0再回到1）
  // duration: 2000ms 表示单程时间，yoyo 会让总时间变为 4000ms（2秒淡出 + 2秒淡入）
  this.tweens.add({
    targets: square,
    alpha: 0,           // 目标透明度为0（完全透明）
    duration: 2000,     // 单程持续2秒
    yoyo: true,         // 启用往返效果（淡出后再淡入）
    repeat: -1,         // 无限循环（-1表示永久重复）
    ease: 'Sine.easeInOut' // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加文本说明
  this.add.text(400, 500, '紫色方块淡入淡出循环动画（4秒一次）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);