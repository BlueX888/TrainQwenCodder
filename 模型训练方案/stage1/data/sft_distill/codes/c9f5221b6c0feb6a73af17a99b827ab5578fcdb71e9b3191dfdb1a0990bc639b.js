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
  // 创建 Graphics 对象绘制青色六边形
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 60;
  const hexColor = 0x00ffff; // 青色
  
  graphics.fillStyle(hexColor, 1);
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 10;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建抖动动画
  // 使用多个快速的小幅度移动来模拟抖动效果
  this.tweens.add({
    targets: hexSprite,
    x: {
      value: '+=10',
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: 3
    },
    y: {
      value: '+=8',
      duration: 60,
      ease: 'Linear',
      yoyo: true,
      repeat: 3
    },
    duration: 4000,
    loop: -1, // 无限循环
    onLoop: () => {
      // 每次循环重置位置，确保抖动从中心开始
      hexSprite.x = 400;
      hexSprite.y = 300;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, '青色六边形抖动动画 (4秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);