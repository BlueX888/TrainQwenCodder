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
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制一个等边三角形（中心在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  graphics.beginPath();
  graphics.moveTo(0, -height * 2/3); // 顶点
  graphics.lineTo(-size / 2, height / 3); // 左下
  graphics.lineTo(size / 2, height / 3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建抖动动画
  // 使用多个 Tween 组成的 Timeline 来实现连续抖动效果
  this.tweens.timeline({
    targets: triangle,
    loop: -1, // 无限循环
    duration: 2000, // 总持续时间 2 秒
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
        x: 400, // 回到原始位置
        y: 300,
        duration: 1600, // 剩余时间
        ease: 'Linear'
      }
    ]
  });
  
  // 添加说明文字
  this.add.text(400, 500, '青色三角形抖动动画 (2秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);