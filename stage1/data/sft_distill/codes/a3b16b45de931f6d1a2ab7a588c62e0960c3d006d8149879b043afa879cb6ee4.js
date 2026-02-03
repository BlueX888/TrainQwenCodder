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
  // 方法1: 使用 Ellipse 游戏对象（推荐）
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ff00);
  
  // 设置初始透明度为 0
  ellipse.setAlpha(0);
  
  // 创建 tween 动画：从透明到不透明，4 秒完成，循环播放
  this.tweens.add({
    targets: ellipse,
    alpha: 1,           // 目标透明度为 1（完全不透明）
    duration: 4000,     // 持续 4 秒（4000 毫秒）
    ease: 'Linear',     // 线性渐变
    yoyo: true,         // 动画结束后反向播放（从 1 回到 0）
    repeat: -1          // 无限循环（-1 表示永久重复）
  });
  
  // 添加说明文字
  this.add.text(400, 50, '椭圆透明度循环动画（4秒周期）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);