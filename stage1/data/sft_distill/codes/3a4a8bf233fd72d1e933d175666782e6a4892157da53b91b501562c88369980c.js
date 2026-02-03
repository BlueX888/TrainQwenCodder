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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制菱形（四个顶点）
  // 中心点在 (50, 50)，大小为 100x100
  const centerX = 50;
  const centerY = 50;
  const size = 50;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    scaleX: 0.8,               // X 轴缩放到 0.8
    scaleY: 0.8,               // Y 轴缩放到 0.8
    duration: 3000,            // 持续 3 秒（3000 毫秒）
    ease: 'Sine.easeInOut',    // 缓动函数，使动画更平滑
    yoyo: true,                // 动画结束后反向播放（恢复到原始大小）
    loop: -1                   // 无限循环（-1 表示永久循环）
  });
  
  // 添加文字说明
  this.add.text(400, 50, '菱形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '3秒缩放到80% → 3秒恢复 → 循环', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);