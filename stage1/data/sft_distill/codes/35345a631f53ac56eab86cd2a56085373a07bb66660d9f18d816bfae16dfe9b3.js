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
  // 使用 Graphics 绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 启用往返效果（到达目标后返回起点）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(300, 50, '粉色椭圆往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);