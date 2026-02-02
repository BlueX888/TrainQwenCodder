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
  // 使用 Graphics 生成黄色椭圆纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  graphics.generateTexture('yellowEllipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'yellowEllipse');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标位置（右侧）
    duration: 1000, // 1秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环 (-1 表示永久循环)
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '黄色椭圆往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);