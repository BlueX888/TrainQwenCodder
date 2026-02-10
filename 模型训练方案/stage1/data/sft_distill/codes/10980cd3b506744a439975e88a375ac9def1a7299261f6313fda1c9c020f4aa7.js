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

// 状态变量
let isAnimating = true;
let sprites = [];
let tweens = [];

function preload() {
  // 程序化生成5个不同颜色的纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(`box${index}`, 80, 80);
    graphics.destroy();
  });
}

function create() {
  // 添加标题文本
  const title = this.add.text(400, 100, '5个物体同步淡入淡出动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 添加状态文本
  const statusText = this.add.text(400, 150, '状态: 动画进行中', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建5个精灵对象，水平排列
  const startX = 160;
  const spacing = 120;
  const y = 300;

  for (let i = 0; i < 5; i++) {
    const sprite = this.add.sprite(startX + i * spacing, y, `box${i}`);
    sprites.push(sprite);

    // 为每个精灵添加淡入淡出动画
    const tween = this.tweens.add({
      targets: sprite,
      alpha: 0,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    tweens.push(tween);
  }

  // 添加计时器文本
  let timeLeft = 3;
  const timerText = this.add.text(400, 450, `剩余时间: ${timeLeft.toFixed(1)}秒`, {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 每100ms更新一次计时器显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (timeLeft > 0) {
        timeLeft -= 0.1;
        timerText.setText(`剩余时间: ${Math.max(0, timeLeft).toFixed(1)}秒`);
      }
    },
    loop: true
  });

  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    // 停止所有 tween 动画
    tweens.forEach(tween => {
      tween.stop();
    });

    // 更新状态
    isAnimating = false;
    statusText.setText('状态: 动画已停止');
    statusText.setColor('#ff0000');

    // 将所有精灵的 alpha 设置为完全可见
    sprites.forEach(sprite => {
      sprite.setAlpha(1);
    });

    // 添加完成提示
    this.add.text(400, 500, '✓ 动画已完成', {
      fontSize: '22px',
      color: '#00ff00'
    }).setOrigin(0.5);

    console.log('动画状态:', isAnimating ? '进行中' : '已停止');
    console.log('所有精灵 alpha 值:', sprites.map(s => s.alpha));
  });

  // 添加说明文本
  this.add.text(400, 550, '动画将在3秒后自动停止', {
    fontSize: '14px',
    color: '#888888'
  }).setOrigin(0.5);

  console.log('初始状态 - 动画进行中:', isAnimating);
  console.log('创建的精灵数量:', sprites.length);
  console.log('创建的补间动画数量:', tweens.length);
}

new Phaser.Game(config);