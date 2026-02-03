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
let animationActive = true;
let statusText;

function preload() {
  // 创建3个不同颜色的方形纹理
  const graphics1 = this.add.graphics();
  graphics1.fillStyle(0xff0000, 1); // 红色
  graphics1.fillRect(0, 0, 80, 80);
  graphics1.generateTexture('box1', 80, 80);
  graphics1.destroy();

  const graphics2 = this.add.graphics();
  graphics2.fillStyle(0x00ff00, 1); // 绿色
  graphics2.fillRect(0, 0, 80, 80);
  graphics2.generateTexture('box2', 80, 80);
  graphics2.destroy();

  const graphics3 = this.add.graphics();
  graphics3.fillStyle(0x0000ff, 1); // 蓝色
  graphics3.fillRect(0, 0, 80, 80);
  graphics3.generateTexture('box3', 80, 80);
  graphics3.destroy();
}

function create() {
  // 创建3个精灵对象
  const sprite1 = this.add.sprite(200, 300, 'box1');
  const sprite2 = this.add.sprite(400, 300, 'box2');
  const sprite3 = this.add.sprite(600, 300, 'box3');

  // 存储所有精灵用于同步控制
  const sprites = [sprite1, sprite2, sprite3];

  // 创建状态显示文本
  statusText = this.add.text(20, 20, 'Animation Status: ACTIVE', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建计时器文本
  const timerText = this.add.text(20, 60, 'Time: 0.00s / 2.50s', {
    fontSize: '20px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 记录开始时间
  const startTime = this.time.now;

  // 为每个精灵创建同步的缩放动画
  const tweens = sprites.map((sprite, index) => {
    return this.tweens.add({
      targets: sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000,
      yoyo: true,
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut',
      delay: index * 100 // 添加轻微延迟制造波浪效果
    });
  });

  // 更新计时器
  const timerEvent = this.time.addEvent({
    delay: 50,
    callback: () => {
      const elapsed = (this.time.now - startTime) / 1000;
      if (elapsed < 2.5) {
        timerText.setText(`Time: ${elapsed.toFixed(2)}s / 2.50s`);
      } else {
        timerText.setText('Time: 2.50s / 2.50s (STOPPED)');
      }
    },
    loop: true
  });

  // 2.5秒后停止所有动画
  this.time.delayedCall(2500, () => {
    // 停止所有缩放动画
    tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有精灵恢复到原始大小
    sprites.forEach(sprite => {
      this.tweens.add({
        targets: sprite,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 更新状态
    animationActive = false;
    statusText.setText('Animation Status: STOPPED');
    statusText.setBackgroundColor('#ff0000');

    // 停止计时器
    timerEvent.remove();

    // 添加完成提示
    const completeText = this.add.text(400, 500, 'Animation Complete!', {
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    completeText.setOrigin(0.5);

    // 完成提示闪烁效果
    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: 3
    });

    console.log('Animation stopped after 2.5 seconds. Status:', animationActive);
  });

  // 添加说明文本
  this.add.text(400, 550, 'Watch the 3 boxes scale synchronously for 2.5 seconds', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

// 创建游戏实例
const game = new Phaser.Game(config);