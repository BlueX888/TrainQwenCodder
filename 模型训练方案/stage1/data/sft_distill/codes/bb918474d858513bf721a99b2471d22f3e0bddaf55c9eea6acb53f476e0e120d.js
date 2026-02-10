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
  // 创建椭圆图形
  const graphics = this.add.graphics();
  
  // 设置填充样式
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制椭圆（中心点在 0,0，半径 100x60）
  graphics.fillEllipse(0, 0, 200, 120);
  
  // 设置椭圆位置到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.24,  // 缩放到 24%
    scaleY: 0.24,  // 缩放到 24%
    duration: 2000,  // 2秒缩小
    yoyo: true,      // 自动恢复（再用2秒），总共4秒完成一次循环
    loop: -1,        // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动效果
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '椭圆缩放动画 (4秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);