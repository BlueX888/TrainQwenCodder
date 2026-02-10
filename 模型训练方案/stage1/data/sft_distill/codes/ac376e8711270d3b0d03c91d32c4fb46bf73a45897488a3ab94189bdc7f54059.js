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
  // 方案1：使用 Ellipse GameObject（推荐）
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ff00);
  
  // 创建闪烁动画：透明度从 1 -> 0 -> 1，总时长 4 秒
  this.tweens.add({
    targets: ellipse,
    alpha: 0,           // 目标透明度
    duration: 2000,     // 单程 2 秒
    yoyo: true,         // 启用往返效果（0 -> 1）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut'  // 平滑过渡
  });

  // 添加提示文本
  this.add.text(400, 500, 'Green Ellipse Blinking (4s cycle)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);