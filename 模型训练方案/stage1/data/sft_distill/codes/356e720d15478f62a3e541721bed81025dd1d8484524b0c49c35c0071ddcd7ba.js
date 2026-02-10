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
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 120，高度 80）
  graphics.fillEllipse(0, 0, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建椭圆精灵，位置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 设置初始透明度为 0（完全透明）
  ellipse.alpha = 0;
  
  // 创建 Tween 动画：从透明到不透明
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    alpha: 1,                   // 目标透明度值（完全不透明）
    duration: 1000,             // 持续时间 1 秒（1000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 反向播放（从 1 回到 0）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 500, '椭圆淡入淡出动画（循环播放）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);