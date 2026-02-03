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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（中心点为 50, 50，半径为 40）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  const sides = 6;
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = centerX + Math.cos(angle) * hexRadius;
    const y = centerY + Math.sin(angle) * hexRadius;
    
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
  
  // 创建六边形精灵并放置在屏幕中央
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建抖动动画
  // 使用 timeline 实现连续的抖动效果
  this.tweens.timeline({
    targets: hexSprite,
    loop: -1, // 无限循环
    duration: 4000, // 总持续时间 4 秒
    tweens: [
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-5, 5),
        y: 300 + Phaser.Math.Between(-5, 5),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400, // 回到原始位置
        y: 300,
        duration: 3600, // 剩余时间保持静止
        ease: 'Linear'
      }
    ]
  });
}

new Phaser.Game(config);