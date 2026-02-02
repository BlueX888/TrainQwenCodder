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
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  
  // 生成纹理
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建 Sprite 对象
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建抖动动画
  // 使用多个连续的 tween 创建抖动效果
  this.tweens.add({
    targets: circle,
    x: '+=10', // 向右偏移
    y: '+=8',  // 向下偏移
    duration: 50,
    yoyo: true, // 返回原位
    repeat: 0,
    onComplete: () => {
      // 第二次抖动
      this.tweens.add({
        targets: circle,
        x: '-=12',
        y: '+=6',
        duration: 50,
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          // 第三次抖动
          this.tweens.add({
            targets: circle,
            x: '+=8',
            y: '-=10',
            duration: 50,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
              // 第四次抖动
              this.tweens.add({
                targets: circle,
                x: '-=6',
                y: '+=7',
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
  
  // 使用更简洁的方式：创建一个循环的抖动效果
  // 使用 timeline 或连续 tween 实现 3 秒循环
  this.time.addEvent({
    delay: 3000, // 3 秒
    callback: () => {
      // 创建随机抖动序列
      const shakeTimeline = this.tweens.timeline({
        targets: circle,
        loop: -1, // 无限循环
        loopDelay: 2700, // 循环间隔，使总周期为 3 秒
        tweens: [
          {
            x: circle.x + Phaser.Math.Between(-15, 15),
            y: circle.y + Phaser.Math.Between(-15, 15),
            duration: 50,
            ease: 'Power2'
          },
          {
            x: circle.x + Phaser.Math.Between(-15, 15),
            y: circle.y + Phaser.Math.Between(-15, 15),
            duration: 50,
            ease: 'Power2'
          },
          {
            x: circle.x + Phaser.Math.Between(-15, 15),
            y: circle.y + Phaser.Math.Between(-15, 15),
            duration: 50,
            ease: 'Power2'
          },
          {
            x: 400, // 回到原位
            y: 300,
            duration: 50,
            ease: 'Power2'
          }
        ]
      });
    },
    callbackScope: this,
    loop: -1 // 无限循环
  });
  
  // 更优雅的实现方式：使用单个循环 tween
  const centerX = 400;
  const centerY = 300;
  
  this.tweens.add({
    targets: circle,
    x: {
      value: () => centerX + Phaser.Math.Between(-12, 12),
      duration: 100,
      ease: 'Sine.easeInOut'
    },
    y: {
      value: () => centerY + Phaser.Math.Between(-12, 12),
      duration: 100,
      ease: 'Sine.easeInOut'
    },
    repeat: -1, // 无限循环
    yoyo: false,
    repeatDelay: 2800 // 使总周期接近 3 秒
  });
}

new Phaser.Game(config);