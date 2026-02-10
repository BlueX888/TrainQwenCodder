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
  // 使用 Graphics 绘制红色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('redRect', 100, 100);
  graphics.destroy();

  // 创建红色矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'redRect');
  
  // 记录原始位置
  const originalX = rect.x;
  const originalY = rect.y;

  // 创建抖动动画
  // 使用 timeline 来实现连续的抖动效果
  this.tweens.timeline({
    targets: rect,
    loop: -1, // 无限循环
    duration: 2000, // 总时长 2 秒
    tweens: [
      // 将抖动分解为多个小步骤，模拟真实抖动效果
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originalX + Phaser.Math.Between(-10, 10),
        y: originalY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      // 最后回到原始位置
      {
        x: originalX,
        y: originalY,
        duration: 1600, // 剩余时间
        ease: 'Sine.easeInOut'
      }
    ]
  });

  // 添加提示文本
  this.add.text(400, 50, '红色矩形抖动动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);