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
  // 方法1: 使用 Ellipse 游戏对象（推荐）
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ff00);
  
  // 设置初始透明度为 0
  ellipse.setAlpha(0);
  
  // 创建渐变动画：从透明(0)到不透明(1)，持续3秒，循环播放
  this.tweens.add({
    targets: ellipse,
    alpha: 1,
    duration: 3000,
    ease: 'Linear',
    yoyo: true,  // 来回循环（0->1->0）
    repeat: -1   // 无限循环
  });
  
  // 添加提示文字
  this.add.text(400, 50, 'Ellipse Fade Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Alpha: 0 -> 1 -> 0 (3 seconds loop)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);