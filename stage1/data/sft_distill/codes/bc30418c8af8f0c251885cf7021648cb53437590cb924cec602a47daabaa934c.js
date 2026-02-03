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
  // 无需加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 在中心位置绘制圆形，半径 80
  graphics.fillCircle(400, 300, 80);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 2000,              // 持续时间 2 秒
    yoyo: true,                  // 来回播放（透明->不透明->透明）
    repeat: -1,                  // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'       // 缓动函数，使渐变更平滑
  });
  
  // 添加文字提示
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);