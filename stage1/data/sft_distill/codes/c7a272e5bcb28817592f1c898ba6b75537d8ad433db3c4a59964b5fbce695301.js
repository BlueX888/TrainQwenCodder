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
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 在画布中心绘制一个半径为 80 的圆形
  const centerX = 400;
  const centerY = 300;
  const radius = 80;
  graphics.fillCircle(centerX, centerY, radius);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度值（完全不透明）
    duration: 2000,              // 动画持续时间 2 秒（2000 毫秒）
    ease: 'Linear',              // 线性缓动函数，匀速变化
    yoyo: true,                  // 动画反向播放（1 -> 0）
    repeat: -1                   // 无限循环播放（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);