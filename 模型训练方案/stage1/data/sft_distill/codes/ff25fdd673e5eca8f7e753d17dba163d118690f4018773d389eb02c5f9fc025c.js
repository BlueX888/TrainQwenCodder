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
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充样式（蓝色）
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在画布中央，宽度 200，高度 120）
  graphics.fillEllipse(400, 300, 200, 120);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建补间动画：从透明到不透明，2.5 秒，循环播放
  this.tweens.add({
    targets: graphics,
    alpha: 1,                    // 目标透明度：完全不透明
    duration: 2500,              // 持续时间：2.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往复播放（不透明后再变回透明）
    repeat: -1                   // 无限循环
  });
  
  // 添加文字提示
  this.add.text(400, 500, '椭圆循环渐变动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);