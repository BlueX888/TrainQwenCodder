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
  // 使用 Graphics 绘制青色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(40, 30, 80, 60); // 在纹理中心绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 2.5秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '青色椭圆往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);