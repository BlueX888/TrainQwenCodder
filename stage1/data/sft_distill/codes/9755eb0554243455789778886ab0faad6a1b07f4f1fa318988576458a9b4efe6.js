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
  graphics.fillStyle(0x3498db, 1);
  
  // 在中心绘制一个半径为 80 的圆形
  const radius = 80;
  graphics.fillCircle(0, 0, radius);
  
  // 将 graphics 对象定位到屏幕中心
  graphics.x = config.width / 2;
  graphics.y = config.height / 2;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.16,               // X轴缩放到16%
    scaleY: 0.16,               // Y轴缩放到16%
    duration: 1500,             // 持续时间1.5秒
    yoyo: true,                 // 启用yoyo效果，动画结束后反向播放回到原始状态
    repeat: -1,                 // 无限循环 (-1表示永久重复)
    ease: 'Sine.easeInOut'      // 使用正弦缓动函数，使动画更流畅
  });
  
  // 添加文字说明
  this.add.text(config.width / 2, 50, '圆形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(config.width / 2, 550, '缩放范围: 100% ↔ 16%  |  周期: 3秒', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);