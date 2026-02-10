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
  
  // 创建 Tween 动画，让椭圆从透明到不透明循环播放
  this.tweens.add({
    targets: ellipse,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 500,               // 持续时间 0.5 秒（500 毫秒）
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 来回播放（1 -> 0 -> 1）
    repeat: -1                   // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, '椭圆正在循环渐变', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);