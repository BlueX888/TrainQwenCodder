const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationActive = false;
let elapsedTime = 0;
let objectsShaking = 0;
let tweens = [];

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 50, '10个物体同步抖动动画', {
    fontSize: '28px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建状态显示文本
  const statusText = this.add.text(400, 100, '', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 存储所有物体
  const objects = [];

  // 创建10个物体，排列成两行
  for (let i = 0; i < 10; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 200 + col * 100;
    const y = 250 + row * 150;

    const obj = this.add.sprite(x, y, 'circle');
    objects.push(obj);
  }

  // 初始化状态
  animationActive = true;
  elapsedTime = 0;
  objectsShaking = 10;
  tweens = [];

  // 为每个物体创建抖动动画
  objects.forEach((obj, index) => {
    // 记录初始位置
    obj.initialX = obj.x;
    obj.initialY = obj.y;

    // 创建抖动 Tween（循环播放）
    const shakeTween = this.tweens.add({
      targets: obj,
      x: obj.initialX + Phaser.Math.Between(-10, 10),
      y: obj.initialY + Phaser.Math.Between(-10, 10),
      duration: 50,
      ease: 'Linear',
      yoyo: false,
      repeat: -1, // 无限循环
      onRepeat: () => {
        // 每次重复时随机新的目标位置
        shakeTween.updateTo('x', obj.initialX + Phaser.Math.Between(-10, 10), true);
        shakeTween.updateTo('y', obj.initialY + Phaser.Math.Between(-10, 10), true);
      }
    });

    tweens.push(shakeTween);
  });

  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    // 停止所有 Tween
    tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有物体恢复到初始位置
    objects.forEach(obj => {
      this.tweens.add({
        targets: obj,
        x: obj.initialX,
        y: obj.initialY,
        duration: 200,
        ease: 'Power2'
      });
    });

    animationActive = false;
    objectsShaking = 0;
  });

  // 更新状态文本
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (animationActive) {
        elapsedTime += 0.1;
      }
      
      const remainingTime = animationActive ? (3 - elapsedTime).toFixed(1) : 0;
      const status = animationActive ? '抖动中' : '已停止';
      
      statusText.setText(
        `状态: ${status} | 活动物体: ${objectsShaking}/10 | 剩余时间: ${remainingTime}s | 已运行: ${elapsedTime.toFixed(1)}s`
      );
    },
    loop: true
  });

  // 添加说明文本
  this.add.text(400, 550, '动画将在3秒后自动停止', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加其他更新逻辑
}

new Phaser.Game(config);