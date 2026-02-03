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
  // 创建椭圆图形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制椭圆（中心点在 0,0，半径 100x60）
  graphics.fillEllipse(0, 0, 200, 120);
  
  // 将椭圆定位到屏幕中心
  graphics.x = 400;
  graphics.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.48,      // 缩放到 48%
    scaleY: 0.48,      // 缩放到 48%
    duration: 2000,    // 持续 2 秒
    yoyo: true,        // 往返播放（缩小后再恢复）
    loop: -1,          // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆缩放动画 (48% ↔ 100%)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);