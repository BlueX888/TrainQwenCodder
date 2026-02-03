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
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在 64, 64，边长约 100）
  const centerX = 64;
  const centerY = 64;
  const size = 50;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 顶点
  graphics.lineTo(centerX + size, centerY);        // 右点
  graphics.lineTo(centerX, centerY + size);        // 底点
  graphics.lineTo(centerX - size, centerY);        // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.48,           // 缩放到 48%
    scaleY: 0.48,           // 缩放到 48%
    duration: 1000,         // 1 秒完成缩放
    yoyo: true,             // 播放完后反向播放（恢复原始大小）
    loop: -1,               // 无限循环
    ease: 'Linear'          // 线性缓动
  });
  
  // 添加文字提示
  this.add.text(400, 50, 'Diamond Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 48% → 100% (Loop)', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);