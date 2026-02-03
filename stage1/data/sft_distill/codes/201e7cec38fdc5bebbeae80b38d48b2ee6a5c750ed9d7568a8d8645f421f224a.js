const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制菱形（四个顶点）
  const size = 60;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 创建 Sprite 并放置在画布中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建旋转动画
  this.tweens.add({
    targets: diamond,
    angle: 360,           // 旋转 360 度
    duration: 4000,       // 持续 4 秒（4000 毫秒）
    ease: 'Linear',       // 线性缓动，保持匀速旋转
    repeat: -1,           // 无限循环
    onRepeat: function() {
      // 每次循环重复时重置角度为 0，避免角度累积
      diamond.angle = 0;
    }
  });
}

new Phaser.Game(config);