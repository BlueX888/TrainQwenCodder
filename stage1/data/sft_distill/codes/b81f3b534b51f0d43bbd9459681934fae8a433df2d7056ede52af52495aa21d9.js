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
  // 使用 Graphics 创建白色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40, 30)，宽80，高60
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(50, 300, 'ellipse');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: ellipse,
    x: 750, // 目标位置（屏幕右侧，留出边距）
    duration: 2500, // 持续时间 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    loop: -1 // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(10, 10, '白色椭圆往返循环动画 (2.5秒)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);