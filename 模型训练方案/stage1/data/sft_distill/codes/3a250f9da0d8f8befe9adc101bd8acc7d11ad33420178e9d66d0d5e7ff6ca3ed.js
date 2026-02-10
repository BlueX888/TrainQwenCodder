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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 计算六边形的顶点坐标
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  const sides = 6;
  
  // 开始绘制路径
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2; // 从顶部开始
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始透明度为 0
  graphics.setAlpha(0);
  
  // 创建渐变动画：从透明（alpha=0）到不透明（alpha=1）
  this.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 1000,        // 1秒
    ease: 'Linear',        // 线性渐变
    yoyo: true,            // 反向播放（从1回到0）
    loop: -1,              // 无限循环
    repeat: 0              // yoyo 模式下不需要额外 repeat
  });
  
  // 添加提示文字
  this.add.text(400, 500, '六边形循环渐变动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);