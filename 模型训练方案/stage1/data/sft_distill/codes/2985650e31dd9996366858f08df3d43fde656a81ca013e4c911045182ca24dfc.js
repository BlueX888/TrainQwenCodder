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
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy();

  // 创建蓝色圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'blueCircle');

  // 创建抖动动画效果
  // 使用多个方向的小幅度移动来模拟抖动
  this.tweens.add({
    targets: circle,
    x: {
      from: 400,
      to: 400,
      ease: 'Sine.easeInOut'
    },
    y: {
      from: 300,
      to: 300,
      ease: 'Sine.easeInOut'
    },
    duration: 1000,
    yoyo: false,
    repeat: -1, // 无限循环
    onUpdate: (tween, target) => {
      // 在动画更新时添加随机抖动偏移
      const progress = tween.progress;
      const intensity = Math.sin(progress * Math.PI * 10) * 5; // 抖动强度
      
      target.x = 400 + Math.random() * intensity - intensity / 2;
      target.y = 300 + Math.random() * intensity - intensity / 2;
    }
  });

  // 添加说明文字
  const text = this.add.text(400, 500, '蓝色圆形抖动动画 (1秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);