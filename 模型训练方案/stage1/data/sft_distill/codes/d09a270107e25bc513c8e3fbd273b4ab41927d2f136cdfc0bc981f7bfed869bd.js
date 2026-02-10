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
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在 100, 75，横向半径 100，纵向半径 75）
  graphics.fillEllipse(100, 75, 200, 150);
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('ellipseTexture', 200, 150);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用该纹理的精灵，放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 设置初始透明度为 0（完全透明）
  ellipse.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    alpha: 1,                   // 目标透明度值（完全不透明）
    duration: 2000,             // 持续时间 2 秒（2000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: false,                // 不反向播放
    repeat: -1,                 // 无限循环（-1 表示永久重复）
    repeatDelay: 0              // 重复之间无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 500, '椭圆从透明渐变到不透明（2秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);