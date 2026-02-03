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
  // 创建青色椭圆
  // 使用 Ellipse 游戏对象，青色 (cyan) 的颜色代码为 0x00ffff
  const ellipse = this.add.ellipse(100, 300, 80, 50, 0x00ffff);
  
  // 创建补间动画
  // 从 x = 100 移动到 x = 700（左到右）
  // duration: 2500ms (2.5秒)
  // yoyo: true 表示往返
  // repeat: -1 表示无限循环
  this.tweens.add({
    targets: ellipse,
    x: 700,
    duration: 2500,
    yoyo: true,
    repeat: -1,
    ease: 'Linear'
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Cyan Ellipse Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The ellipse moves left to right in 2.5s and loops', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);