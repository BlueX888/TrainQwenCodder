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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexagonRadius = 40;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.lineStyle(2, 0x00ffff, 1);
  
  graphics.beginPath();
  
  // 计算六边形各顶点并绘制
  for (let i = 0; i < sides; i++) {
    const x = hexagonRadius * Math.cos(angle * i - Math.PI / 2);
    const y = hexagonRadius * Math.sin(angle * i - Math.PI / 2);
    
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
  const textureSize = hexagonRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const hexagonSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右，4 秒完成，yoyo 往返，无限循环
  this.tweens.add({
    targets: hexagonSprite,
    x: 700, // 移动到右侧
    duration: 4000, // 4 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返
    repeat: -1 // 无限循环 (-1 表示无限)
  });
  
  // 添加提示文本
  this.add.text(400, 50, '青色六边形往返循环移动', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);