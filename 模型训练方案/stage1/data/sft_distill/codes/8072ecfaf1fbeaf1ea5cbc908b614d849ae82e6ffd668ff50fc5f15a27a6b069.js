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
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillCircle(50, 50, 50);
  graphics.generateTexture('blueCircle', 100, 100);
  graphics.destroy();

  // 创建圆形精灵
  const circle = this.add.sprite(400, 300, 'blueCircle');

  // 创建抖动动画
  // 抖动效果通过快速改变位置实现
  this.tweens.add({
    targets: circle,
    x: {
      value: '+=10',
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: 9  // 重复9次，加上原始1次 = 10次，共1秒（50ms * 20 = 1000ms）
    },
    y: {
      value: '-=10',
      duration: 50,
      ease: 'Linear',
      yoyo: true,
      repeat: 9
    },
    loop: -1,  // 无限循环
    onRepeat: () => {
      // 每次循环时随机改变抖动方向，增加随机性
      const randomX = Phaser.Math.Between(-10, 10);
      const randomY = Phaser.Math.Between(-10, 10);
      
      this.tweens.add({
        targets: circle,
        x: 400 + randomX,
        y: 300 + randomY,
        duration: 50,
        ease: 'Linear'
      });
    }
  });

  // 添加提示文字
  this.add.text(400, 500, '蓝色圆形抖动动画 (1秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);