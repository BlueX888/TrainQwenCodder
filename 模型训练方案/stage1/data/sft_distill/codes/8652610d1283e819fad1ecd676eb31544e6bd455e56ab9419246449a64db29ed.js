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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在 100, 75，宽度 200，高度 150）
  graphics.fillEllipse(100, 75, 200, 150);
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('ellipseTexture', 200, 150);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用该纹理的精灵对象，放置在屏幕中心
  const ellipseSprite = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 设置初始 alpha 为 0（完全透明）
  ellipseSprite.alpha = 0;
  
  // 创建 Tween 动画：从透明（alpha: 0）到不透明（alpha: 1）
  this.tweens.add({
    targets: ellipseSprite,           // 动画目标对象
    alpha: 1,                          // 目标 alpha 值
    duration: 1000,                    // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',                    // 线性缓动
    yoyo: true,                        // 来回播放（透明->不透明->透明）
    repeat: -1                         // 无限循环（-1 表示永久重复）
  });
}

// 启动游戏
new Phaser.Game(config);