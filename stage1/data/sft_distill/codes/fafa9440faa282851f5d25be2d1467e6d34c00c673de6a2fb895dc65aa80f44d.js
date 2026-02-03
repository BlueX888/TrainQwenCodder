const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形的参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100;
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.lineStyle(4, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度 60 度
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建六边形精灵并放置在屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexagon,
    scaleX: 0.32, // 缩放到 32%
    scaleY: 0.32,
    duration: 3000, // 3 秒
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1, // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Hexagon scaling animation (1.0 → 0.32 → 1.0)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);