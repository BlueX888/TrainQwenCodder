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
let objects = [];
let tweens = [];

function preload() {
  // 创建5个不同颜色的纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(`object${index}`, 80, 80);
    graphics.destroy();
  });
}

function create() {
  // 重置状态变量
  animationStatus = 'running';
  elapsedTime = 0;
  objects = [];
  tweens = [];

  // 创建标题文本
  this.add.text(400, 50, '同步淡入淡出动画', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 状态显示文本
  const statusText = this.add.text(400, 100, '', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建5个物体，水平排列
  const startX = 160;
  const spacing = 120;
  const yPos = 300;

  for (let i = 0; i < 5; i++) {
    const sprite = this.add.sprite(
      startX + i * spacing,
      yPos,
      `object${i}`
    );
    objects.push(sprite);

    // 为每个物体创建淡入淡出动画
    const tween = this.tweens.add({
      targets: sprite,
      alpha: 0, // 从1淡出到0
      duration: 1000, // 1秒淡出
      yoyo: true, // 淡出后再淡入
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(tween);
  }

  // 添加说明文本
  this.add.text(400, 500, '动画将在3秒后自动停止', {
    fontSize: '18px',
    color: '#cccccc'
  }).setOrigin(0.5);

  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    tweens.forEach(tween => {
      tween.stop();
    });
    animationStatus = 'stopped';
    
    // 确保所有物体完全显示（alpha = 1）
    objects.forEach(obj => {
      obj.setAlpha(1);
    });
    
    statusText.setText('动画已停止！');
    statusText.setColor('#ff0000');
    
    console.log('Animation stopped after 3 seconds');
    console.log('Final status:', animationStatus);
    console.log('Elapsed time:', elapsedTime.toFixed(2), 'seconds');
  });

  // 更新状态显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (animationStatus === 'running') {
        statusText.setText(`状态: ${animationStatus} | 时间: ${elapsedTime.toFixed(1)}s / 3.0s`);
      }
    },
    loop: true
  });
}

function update(time, delta) {
  // 更新已运行时间
  if (animationStatus === 'running') {
    elapsedTime += delta / 1000;
    
    // 防止超过3秒（由于定时器精度）
    if (elapsedTime > 3) {
      elapsedTime = 3;
    }
  }
}

new Phaser.Game(config);