const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('grayBox', 100, 100);
  graphics.destroy();

  // 创建方块精灵并居中
  const box = this.add.sprite(400, 300, 'grayBox');

  // 创建抖动动画效果
  // 使用快速的左右抖动来模拟震动效果
  this.tweens.add({
    targets: box,
    x: '+=10', // 向右移动10像素
    duration: 50, // 50毫秒
    yoyo: true, // 返回原位
    repeat: 9, // 重复9次（加上第一次共10次，总计1秒）
    ease: 'Linear',
    onComplete: () => {
      // 第一组抖动完成后，立即开始反向抖动
      this.tweens.add({
        targets: box,
        x: '-=10', // 向左移动10像素
        duration: 50,
        yoyo: true,
        repeat: 9,
        ease: 'Linear',
        loop: -1, // 无限循环
        loopDelay: 0
      });
    }
  });

  // 或者使用更简单的方式：同时在 x 和 y 轴上抖动
  // 注释掉上面的代码，使用下面的代码可以实现更自然的抖动效果
  /*
  this.tweens.add({
    targets: box,
    x: box.x + Phaser.Math.Between(-8, 8),
    y: box.y + Phaser.Math.Between(-8, 8),
    duration: 50,
    ease: 'Power2',
    yoyo: true,
    repeat: 9, // 总共1秒（50ms * 2 * 10 = 1000ms）
    loop: -1, // 无限循环
    onRepeat: () => {
      // 每次重复时随机设置新的抖动位置
      const tween = this.tweens.getTweensOf(box)[0];
      if (tween) {
        tween.updateTo('x', box.x + Phaser.Math.Between(-8, 8), true);
        tween.updateTo('y', box.y + Phaser.Math.Between(-8, 8), true);
      }
    }
  });
  */
}

new Phaser.Game(config);