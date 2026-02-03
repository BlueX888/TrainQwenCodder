const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制椭圆（中心点在 0,0，宽度 120，高度 80）
  graphics.fillEllipse(60, 40, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建椭圆精灵对象，放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    scaleX: 0.8,                // X 轴缩放到 80%
    scaleY: 0.8,                // Y 轴缩放到 80%
    duration: 2000,             // 动画持续时间 2 秒（单程）
    ease: 'Sine.easeInOut',     // 缓动函数，使动画更平滑
    yoyo: true,                 // 往返播放（缩小后再放大）
    loop: -1                    // 无限循环（-1 表示永久循环）
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Ellipse scaling animation (80% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);