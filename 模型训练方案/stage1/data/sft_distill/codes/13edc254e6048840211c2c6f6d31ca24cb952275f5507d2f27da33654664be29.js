const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x888888, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('grayBox', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建灰色方块精灵，放置在屏幕中央
  const box = this.add.sprite(400, 300, 'grayBox');
  
  // 创建抖动动画
  this.tweens.add({
    targets: box,
    // 在 x 和 y 方向上随机抖动
    x: {
      from: 400,
      to: 400,
      ease: 'Sine.easeInOut',
      duration: 50,
      yoyo: true,
      repeat: 9, // 50ms * 2(yoyo) * 10(repeat+1) = 1000ms
      onUpdate: function(tween, target) {
        // 每次更新时添加随机偏移实现抖动效果
        const progress = tween.progress;
        if (progress > 0 && progress < 1) {
          target.x = 400 + Phaser.Math.Between(-5, 5);
          target.y = 300 + Phaser.Math.Between(-5, 5);
        }
      }
    },
    // 1 秒完成一次抖动循环
    duration: 1000,
    repeat: -1, // 无限循环
    onRepeat: function(tween, target) {
      // 每次循环重置位置
      target.x = 400;
      target.y = 300;
    }
  });
  
  // 更简洁的抖动实现方式
  // 使用定时器每帧随机偏移
  this.time.addEvent({
    delay: 50, // 每 50ms 抖动一次
    callback: () => {
      // 在 1 秒周期内抖动
      const elapsed = this.time.now % 1000;
      if (elapsed < 1000) {
        box.x = 400 + Phaser.Math.Between(-8, 8);
        box.y = 300 + Phaser.Math.Between(-8, 8);
      }
    },
    loop: true
  });
}

new Phaser.Game(config);