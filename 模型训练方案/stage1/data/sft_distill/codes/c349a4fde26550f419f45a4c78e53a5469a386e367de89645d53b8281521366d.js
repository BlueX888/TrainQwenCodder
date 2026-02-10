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
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('yellowBox', 80, 80);
  graphics.destroy();

  // 创建方块精灵
  const box = this.add.sprite(400, 300, 'yellowBox');

  // 创建抖动动画效果
  // 使用多个快速的随机位置变化来模拟抖动
  this.tweens.add({
    targets: box,
    x: '+=10',
    y: '+=5',
    duration: 50,
    yoyo: true,
    repeat: -1,
    repeatDelay: 0,
    onRepeat: () => {
      // 每次重复时随机改变抖动方向和幅度
      const randomX = Phaser.Math.Between(-10, 10);
      const randomY = Phaser.Math.Between(-10, 10);
      
      this.tweens.add({
        targets: box,
        x: 400 + randomX,
        y: 300 + randomY,
        duration: 50,
        ease: 'Linear'
      });
    }
  });

  // 使用更优雅的方式：创建一个循环的抖动序列
  // 重新实现：使用 timeline 或链式 tween
  box.x = 400;
  box.y = 300;

  // 创建抖动效果的核心逻辑
  const createShakeTween = () => {
    // 3秒内进行多次快速抖动
    const shakeCount = 30; // 抖动次数
    const shakeDuration = 3000 / shakeCount; // 每次抖动时长

    const timeline = this.tweens.timeline({
      loop: -1, // 无限循环
      loopDelay: 0
    });

    // 添加多个快速抖动
    for (let i = 0; i < shakeCount; i++) {
      const offsetX = Phaser.Math.Between(-8, 8);
      const offsetY = Phaser.Math.Between(-8, 8);

      timeline.add({
        targets: box,
        x: 400 + offsetX,
        y: 300 + offsetY,
        duration: shakeDuration,
        ease: 'Linear'
      });
    }

    // 最后回到原位
    timeline.add({
      targets: box,
      x: 400,
      y: 300,
      duration: 100,
      ease: 'Quad.easeOut'
    });

    timeline.play();
  };

  // 清除之前的 tween，使用新的实现
  this.tweens.killTweensOf(box);
  createShakeTween();

  // 添加文字说明
  this.add.text(400, 500, '黄色方块抖动动画 (3秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);