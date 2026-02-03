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
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  // 绘制菱形（中心点在 64, 64）
  const centerX = 64;
  const centerY = 64;
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
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    scaleX: 0.8,               // X轴缩放到 80%
    scaleY: 0.8,               // Y轴缩放到 80%
    duration: 3000,            // 动画时长 3 秒
    yoyo: true,                // 启用 yoyo 模式，动画结束后反向播放回到原始状态
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'     // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '菱形缩放动画（循环播放）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);