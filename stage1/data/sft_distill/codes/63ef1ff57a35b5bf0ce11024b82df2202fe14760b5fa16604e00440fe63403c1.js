const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态信号变量
let animationStatus = 'running'; // 'running' 或 'stopped'
let elapsedTime = 0;
let objectsBlinking = 0;

function preload() {
  // 使用 Graphics 创建纯色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('blinkObject', 40, 40);
  graphics.destroy();
}

function create() {
  // 初始化状态
  animationStatus = 'running';
  elapsedTime = 0;
  objectsBlinking = 20;

  // 显示状态文本
  const statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 创建20个物体并随机分布
  const objects = [];
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const obj = this.add.sprite(x, y, 'blinkObject');
    objects.push(obj);
  }

  // 为所有物体创建同步闪烁动画
  const blinkTweens = [];
  objects.forEach(obj => {
    const tween = this.tweens.add({
      targets: obj,
      alpha: 0,
      duration: 500, // 0.5秒变透明
      yoyo: true,    // 来回循环
      repeat: -1,    // 无限重复
      ease: 'Sine.easeInOut'
    });
    blinkTweens.push(tween);
  });

  // 3秒后停止所有闪烁动画
  this.time.delayedCall(3000, () => {
    blinkTweens.forEach(tween => {
      tween.stop();
    });
    
    // 恢复所有物体的完全不透明状态
    objects.forEach(obj => {
      obj.alpha = 1;
    });
    
    // 更新状态信号
    animationStatus = 'stopped';
    objectsBlinking = 0;
    
    console.log('Animation stopped after 3 seconds');
  });

  // 更新状态显示
  this.events.on('update', () => {
    elapsedTime = this.time.now / 1000;
    statusText.setText([
      `Status: ${animationStatus}`,
      `Elapsed Time: ${elapsedTime.toFixed(2)}s`,
      `Objects Blinking: ${objectsBlinking}`,
      `Total Objects: 20`
    ]);
    
    // 3秒后更新闪烁物体数量
    if (elapsedTime >= 3) {
      objectsBlinking = 0;
    }
  });

  // 添加提示文本
  this.add.text(400, 580, 'Watch the synchronized blinking for 3 seconds', {
    fontSize: '18px',
    fill: '#ffff00'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);