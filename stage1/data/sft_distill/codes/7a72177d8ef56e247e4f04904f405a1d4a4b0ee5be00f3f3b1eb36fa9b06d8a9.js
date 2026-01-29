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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个顶点坐标）
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: diamond,
    x: 700,              // 目标 x 坐标（右侧）
    duration: 1000,      // 持续时间 1 秒
    ease: 'Linear',      // 线性缓动
    yoyo: true,          // 启用往返效果（到达终点后反向播放）
    loop: -1,            // 无限循环（-1 表示永久循环）
    repeat: 0            // yoyo 模式下不需要额外的 repeat
  });
  
  // 添加提示文本
  this.add.text(400, 50, '白色菱形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);