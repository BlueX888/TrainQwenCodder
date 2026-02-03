const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制菱形（中心点在 50, 50）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(50, 0);           // 顶点
  graphics.lineTo(100, 50);         // 右点
  graphics.lineTo(50, 100);         // 底点
  graphics.lineTo(0, 50);           // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建抖动动画效果
  // 使用 timeline 组合多个小幅度的随机移动来模拟抖动
  this.tweens.timeline({
    targets: diamond,
    loop: -1, // 无限循环
    duration: 4000, // 总时长 4 秒
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
        x: 400, // 回到原点
        y: 300,
        duration: 3600, // 剩余时间
        ease: 'Linear'
      }
    ]
  });
  
  // 添加说明文字
  this.add.text(400, 500, '灰色菱形抖动动画（4秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);