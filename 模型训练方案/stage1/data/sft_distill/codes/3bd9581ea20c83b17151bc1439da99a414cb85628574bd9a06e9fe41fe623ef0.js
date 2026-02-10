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
  // 使用 Graphics 绘制椭圆并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在 100, 60，半径 100x60）
  graphics.fillEllipse(100, 60, 200, 120);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 200, 120);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建椭圆精灵，放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    scaleX: 0.8,                // X 轴缩放到 80%
    scaleY: 0.8,                // Y 轴缩放到 80%
    duration: 2000,             // 持续时间 2 秒（2000 毫秒）
    yoyo: true,                 // 启用往复效果（缩小后自动恢复）
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆缩放动画 (80% ↔ 100%)', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);