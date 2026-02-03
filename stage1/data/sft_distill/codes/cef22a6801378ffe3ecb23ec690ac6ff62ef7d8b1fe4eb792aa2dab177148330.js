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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制六边形（正六边形）
  const hexRadius = 40; // 六边形半径
  const centerX = 50;
  const centerY = 50;
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
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
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: hexSprite,
    x: 700, // 目标位置（右侧）
    duration: 2500, // 2.5秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);