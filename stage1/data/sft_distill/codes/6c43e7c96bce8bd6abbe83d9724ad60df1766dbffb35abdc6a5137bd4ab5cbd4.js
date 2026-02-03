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
  
  // 创建补间动画，从透明到不透明循环播放
  this.tweens.add({
    targets: ellipse,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 500,               // 持续时间 0.5 秒
    yoyo: true,                  // 启用 yoyo 效果，动画会反向播放（从 1 回到 0）
    repeat: -1,                  // 无限循环
    ease: 'Linear'               // 线性缓动
  });
  
  // 添加提示文字
  this.add.text(400, 500, '椭圆循环淡入淡出动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);