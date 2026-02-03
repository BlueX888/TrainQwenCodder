const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100;
  const centerY = 100;
  
  // 绘制六边形（6个边，每个顶点间隔60度）
  graphics.fillStyle(0x00ff88, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
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
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 graphics 对象，释放内存
  
  // 创建六边形精灵并设置到屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建渐变动画：从透明到不透明，3秒，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 3000, // 持续时间 3 秒
    ease: 'Linear', // 线性缓动
    yoyo: false, // 不反向播放
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加提示文本
  this.add.text(400, 500, '六边形正在从透明渐变到不透明（循环播放）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);