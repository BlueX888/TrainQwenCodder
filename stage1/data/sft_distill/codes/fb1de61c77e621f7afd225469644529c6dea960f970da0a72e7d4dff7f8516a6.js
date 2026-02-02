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
  // 使用 Graphics 绘制青色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');

  // 创建抖动动画
  // 使用多个 Tween 组成抖动效果
  this.tweens.add({
    targets: circle,
    x: '+=10', // 向右偏移
    y: '+=8',  // 向下偏移
    duration: 50,
    yoyo: true, // 往返运动
    repeat: -1, // 无限重复
    ease: 'Sine.easeInOut'
  });

  // 添加第二个方向的抖动，形成更自然的抖动效果
  this.tweens.add({
    targets: circle,
    x: '-=8',
    y: '+=10',
    duration: 70,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    delay: 25 // 稍微错开时间，形成不规则抖动
  });

  // 使用 Timeline 创建完整的 3 秒循环抖动效果
  const timeline = this.tweens.timeline({
    targets: circle,
    loop: -1, // 无限循环
    loopDelay: 0
  });

  // 添加多个小幅度的随机抖动
  for (let i = 0; i < 30; i++) {
    const randomX = Phaser.Math.Between(-5, 5);
    const randomY = Phaser.Math.Between(-5, 5);
    
    timeline.add({
      x: `+=${randomX}`,
      y: `+=${randomY}`,
      duration: 100,
      ease: 'Power1'
    });
  }

  // 添加提示文字
  const text = this.add.text(400, 500, '青色圆形抖动动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);