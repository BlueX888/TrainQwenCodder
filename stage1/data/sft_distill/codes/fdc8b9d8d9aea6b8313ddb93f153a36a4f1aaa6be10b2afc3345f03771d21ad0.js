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
  
  // 创建补间动画：3秒内从透明(0)渐变到不透明(1)，循环播放
  this.tweens.add({
    targets: ellipse,
    alpha: 1,           // 目标透明度
    duration: 3000,     // 持续时间 3 秒
    ease: 'Linear',     // 线性缓动
    yoyo: true,         // 往返播放（1->0->1）
    repeat: -1          // 无限循环
  });
  
  // 添加文字提示
  this.add.text(400, 500, '椭圆会在 3 秒内从透明渐变到不透明，循环播放', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);