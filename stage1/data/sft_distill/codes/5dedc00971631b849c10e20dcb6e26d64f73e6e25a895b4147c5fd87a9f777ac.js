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
  // 创建绿色椭圆
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ff00);
  
  // 创建闪烁动画
  // 使用 alpha 透明度从 1 降到 0，再从 0 升到 1，完成一次闪烁
  this.tweens.add({
    targets: ellipse,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 2000,     // 单程 2 秒
    yoyo: true,         // 启用往返效果（0 -> 1 -> 0）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数使闪烁更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 500, '绿色椭圆闪烁动画 (4秒一次循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);