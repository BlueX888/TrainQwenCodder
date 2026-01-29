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
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size); // 上顶点
  graphics.lineTo(centerX + size, centerY); // 右顶点
  graphics.lineTo(centerX, centerY + size); // 下顶点
  graphics.lineTo(centerX - size, centerY); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  // 从完全不透明(alpha=1)到完全透明(alpha=0)，然后循环
  this.tweens.add({
    targets: diamond,
    alpha: 0, // 目标透明度为0（完全透明）
    duration: 250, // 淡出持续250毫秒
    yoyo: true, // 启用yoyo效果，动画会反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加说明文字
  this.add.text(400, 500, '绿色菱形淡入淡出循环动画 (0.5秒/次)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);