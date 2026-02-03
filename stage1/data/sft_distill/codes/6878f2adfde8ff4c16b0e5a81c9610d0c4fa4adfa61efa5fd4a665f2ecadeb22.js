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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  graphics.generateTexture('cyanCircle', 100, 100);
  graphics.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(400, 300, 'cyanCircle');

  // 创建抖动动画
  // 使用多个连续的 Tween 来模拟抖动效果
  this.tweens.timeline({
    targets: circle,
    loop: -1, // 无限循环
    duration: 3000, // 总时长 3 秒
    tweens: [
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: 400 + Phaser.Math.Between(-10, 10),
        y: 300 + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      // 最后回到原始位置
      {
        x: 400,
        y: 300,
        duration: 2500, // 剩余时间
        ease: 'Linear'
      }
    ]
  });

  // 添加文字说明
  this.add.text(400, 50, '抖动动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);