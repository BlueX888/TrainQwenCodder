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
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制六边形（中心点在 50, 50，半径为 40）
  const hexagonRadius = 40;
  const centerX = 50;
  const centerY = 50;
  const sides = 6;
  
  // 开始绘制路径
  graphics.beginPath();
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + hexagonRadius * Math.cos(angle);
    const y = centerY + hexagonRadius * Math.sin(angle);
    
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
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const hexagonSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画
  this.tweens.add({
    targets: hexagonSprite,
    x: 700, // 移动到右侧
    duration: 2500, // 2.5秒
    ease: 'Linear',
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '粉色六边形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);