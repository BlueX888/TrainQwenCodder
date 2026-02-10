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
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  
  // 生成纹理
  graphics.generateTexture('cyanCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(400, 300, 'cyanCircle');
  
  // 记录原始位置
  const originX = circle.x;
  const originY = circle.y;
  
  // 创建抖动动画
  // 使用 timeline 创建连续的抖动效果
  this.tweens.timeline({
    targets: circle,
    loop: -1, // 无限循环
    duration: 3000, // 总持续时间3秒
    tweens: [
      {
        x: originX + Phaser.Math.Between(-10, 10),
        y: originY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originX + Phaser.Math.Between(-10, 10),
        y: originY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originX + Phaser.Math.Between(-10, 10),
        y: originY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originX + Phaser.Math.Between(-10, 10),
        y: originY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originX + Phaser.Math.Between(-10, 10),
        y: originY + Phaser.Math.Between(-10, 10),
        duration: 50,
        ease: 'Linear'
      },
      {
        x: originX,
        y: originY,
        duration: 2750, // 剩余时间回到原位
        ease: 'Sine.easeInOut'
      }
    ]
  });
  
  // 另一种实现方式：使用单个 tween 配合 onUpdate 回调
  /*
  this.tweens.add({
    targets: circle,
    duration: 3000,
    loop: -1,
    onUpdate: (tween) => {
      // 在前250ms内产生抖动效果
      if (tween.progress < 0.083) { // 250ms / 3000ms ≈ 0.083
        circle.x = originX + Phaser.Math.Between(-8, 8);
        circle.y = originY + Phaser.Math.Between(-8, 8);
      } else {
        // 平滑回到原位
        const easeProgress = (tween.progress - 0.083) / 0.917;
        circle.x = Phaser.Math.Linear(circle.x, originX, 0.1);
        circle.y = Phaser.Math.Linear(circle.y, originY, 0.1);
      }
    }
  });
  */
  
  // 推荐的实现方式：使用链式 tween 实现更真实的抖动
  const shakeIntensity = 8;
  const shakeDuration = 300; // 抖动持续300ms
  const restDuration = 2700; // 休息2700ms
  
  // 创建抖动序列
  const createShakeTween = () => {
    return this.tweens.add({
      targets: circle,
      x: {
        from: originX,
        to: originX + Phaser.Math.Between(-shakeIntensity, shakeIntensity)
      },
      y: {
        from: originY,
        to: originY + Phaser.Math.Between(-shakeIntensity, shakeIntensity)
      },
      duration: 30,
      yoyo: true,
      repeat: shakeDuration / 60 - 1, // 重复次数
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 抖动完成后，回到原位并等待
        this.tweens.add({
          targets: circle,
          x: originX,
          y: originY,
          duration: 200,
          ease: 'Back.easeOut',
          onComplete: () => {
            // 等待一段时间后再次抖动
            this.time.delayedCall(restDuration - 200, () => {
              createShakeTween();
            });
          }
        });
      }
    });
  };
  
  // 启动第一次抖动
  createShakeTween();
}

new Phaser.Game(config);