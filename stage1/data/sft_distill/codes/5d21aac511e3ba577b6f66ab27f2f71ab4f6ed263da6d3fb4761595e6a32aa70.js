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
  // 创建矩形图形对象
  const graphics = this.add.graphics();
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制一个矩形（中心点在原点，便于缩放）
  const rectWidth = 200;
  const rectHeight = 150;
  graphics.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight);
  
  // 设置矩形位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    scaleX: 0.16,               // X轴缩放到16%
    scaleY: 0.16,               // Y轴缩放到16%
    duration: 2000,             // 持续时间2秒
    yoyo: true,                 // 动画结束后反向播放（恢复原始大小）
    loop: -1,                   // 无限循环（-1表示永久循环）
    ease: 'Sine.easeInOut'      // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 50, '矩形缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2秒缩放到16% → 2秒恢复 → 循环', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);