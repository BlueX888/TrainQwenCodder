const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量：记录动画状态
let animationStatus = 'running'; // 可能值：'running', 'stopped'
let animationProgress = 0; // 0-100 的进度百分比
let objectsShaking = 10; // 正在抖动的物体数量

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 初始化状态
  animationStatus = 'running';
  animationProgress = 0;
  objectsShaking = 10;

  // 创建状态文本显示
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 存储所有物体和动画
  const objects = [];
  const tweens = [];

  // 创建10个物体，排列成两行
  for (let i = 0; i < 10; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 150 + col * 120;
    const y = 250 + row * 150;

    // 创建物体
    const obj = this.add.sprite(x, y, 'circle');
    objects.push(obj);

    // 为每个物体创建抖动动画
    const shakeTween = this.tweens.add({
      targets: obj,
      x: x + Phaser.Math.Between(-10, 10),
      y: y + Phaser.Math.Between(-10, 10),
      duration: 100,
      yoyo: true,
      repeat: -1, // 无限重复
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        // 每次更新时随机改变目标位置，增强抖动效果
        if (Math.random() > 0.9) {
          shakeTween.updateTo('x', x + Phaser.Math.Between(-10, 10), true);
          shakeTween.updateTo('y', y + Phaser.Math.Between(-10, 10), true);
        }
      }
    });

    tweens.push(shakeTween);
  }

  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    // 停止所有 tween
    tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有物体恢复到原始位置
    objects.forEach((obj, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = 150 + col * 120;
      const y = 250 + row * 150;

      this.tweens.add({
        targets: obj,
        x: x,
        y: y,
        duration: 200,
        ease: 'Power2'
      });
    });

    // 更新状态
    animationStatus = 'stopped';
    animationProgress = 100;
    objectsShaking = 0;
  });

  // 更新进度
  this.time.addEvent({
    delay: 30,
    callback: () => {
      if (animationStatus === 'running') {
        animationProgress = Math.min(100, animationProgress + (100 / 3000) * 30);
      }
    },
    loop: true
  });

  // 更新状态显示
  this.time.addEvent({
    delay: 50,
    callback: () => {
      statusText.setText([
        `Status: ${animationStatus}`,
        `Progress: ${animationProgress.toFixed(1)}%`,
        `Objects Shaking: ${objectsShaking}`,
        `Time: ${(animationProgress * 30 / 1000).toFixed(2)}s / 3.00s`
      ]);
    },
    loop: true
  });

  // 添加标题
  this.add.text(400, 50, 'Synchronized Shake Animation', {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 80, '(Will stop after 3 seconds)', {
    fontSize: '16px',
    fill: '#cccccc'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);