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
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(60, 40, 120, 80); // 在(60, 40)位置绘制椭圆，宽120，高80
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('ellipse', 120, 80);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建椭圆精灵并设置初始透明度为0
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  ellipse.setAlpha(0);
  
  // 创建渐变动画：从透明(alpha=0)到不透明(alpha=1)
  this.tweens.add({
    targets: ellipse,
    alpha: 1, // 目标透明度
    duration: 2500, // 持续时间2.5秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 来回播放（0->1->0）
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, '椭圆循环渐变动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);