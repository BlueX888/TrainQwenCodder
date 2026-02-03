const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制紫色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillEllipse(0, 0, 80, 50); // 在中心点绘制椭圆，宽80高50
  
  // 将 graphics 转换为纹理以便用于精灵
  graphics.generateTexture('ellipse', 80, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建椭圆精灵
  const ellipse = this.add.sprite(100, 300, 'ellipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 4000, // 持续 4 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环（-1 表示永远重复）
  });
  
  // 添加文字提示
  this.add.text(300, 50, '紫色椭圆往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);