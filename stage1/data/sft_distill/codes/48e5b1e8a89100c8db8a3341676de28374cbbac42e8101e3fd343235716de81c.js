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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（四个顶点）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1,                    // 目标透明度为 1（完全不透明）
    duration: 500,               // 持续时间 0.5 秒
    yoyo: true,                  // 来回播放（1 -> 0 -> 1）
    repeat: -1,                  // 无限循环
    ease: 'Linear'               // 线性渐变
  });
  
  // 添加说明文字
  this.add.text(400, 500, '菱形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);