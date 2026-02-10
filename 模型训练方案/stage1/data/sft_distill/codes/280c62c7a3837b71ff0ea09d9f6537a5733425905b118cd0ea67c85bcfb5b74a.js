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
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('grayBox', 80, 80);
  graphics.destroy();

  // 创建方块精灵，放置在屏幕中央
  const box = this.add.sprite(400, 300, 'grayBox');

  // 创建抖动动画
  // 使用多个关键帧快速改变位置来模拟抖动效果
  this.tweens.add({
    targets: box,
    x: '+=10',
    y: '+=5',
    duration: 50,
    yoyo: true,
    repeat: 0,
    onComplete: () => {
      // 第一次抖动完成后，继续其他方向的抖动
      this.tweens.add({
        targets: box,
        x: '-=10',
        y: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          // 第二次抖动完成后，继续
          this.tweens.add({
            targets: box,
            x: '+=5',
            y: '-=10',
            duration: 50,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
              // 第三次抖动完成后，继续
              this.tweens.add({
                targets: box,
                x: '-=5',
                y: '+=10',
                duration: 50,
                yoyo: true,
                repeat: 0
              });
            }
          });
        }
      });
    }
  });

  // 更简洁的方案：使用 Timeline 创建连续抖动效果
  const timeline = this.tweens.createTimeline({
    loop: -1, // 无限循环
    loopDelay: 0
  });

  // 添加多个抖动关键帧
  const shakeIntensity = 8;
  const shakeDuration = 50;
  const shakeSteps = 10; // 1000ms / 100ms per cycle

  for (let i = 0; i < shakeSteps; i++) {
    timeline.add({
      targets: box,
      x: 400 + (Math.random() - 0.5) * shakeIntensity * 2,
      y: 300 + (Math.random() - 0.5) * shakeIntensity * 2,
      duration: shakeDuration,
      ease: 'Linear'
    });
  }

  // 最后回到原位
  timeline.add({
    targets: box,
    x: 400,
    y: 300,
    duration: shakeDuration,
    ease: 'Quad.easeOut'
  });

  timeline.play();
}

new Phaser.Game(config);