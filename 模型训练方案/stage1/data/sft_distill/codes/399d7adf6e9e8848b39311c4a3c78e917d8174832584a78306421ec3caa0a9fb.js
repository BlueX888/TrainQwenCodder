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
  // 方法1：使用 Ellipse 游戏对象（推荐）
  const ellipse = this.add.ellipse(400, 300, 200, 120, 0x00ff00);
  
  // 设置初始透明度为 0
  ellipse.setAlpha(0);
  
  // 创建 Tween 动画，让椭圆从透明渐变到不透明
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    alpha: 1,                   // 目标透明度值
    duration: 4000,             // 持续时间 4 秒
    ease: 'Linear',             // 线性缓动
    yoyo: false,                // 不反向播放
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    repeatDelay: 0              // 重复之间无延迟
  });
  
  // 添加提示文本
  this.add.text(400, 500, '椭圆正在循环淡入（4秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);