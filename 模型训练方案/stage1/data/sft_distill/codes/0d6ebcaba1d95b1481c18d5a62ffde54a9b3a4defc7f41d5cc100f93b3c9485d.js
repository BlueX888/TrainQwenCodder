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

// 全局状态变量
let animationState = {
  isRunning: true,
  completedCount: 0,
  totalObjects: 10,
  elapsedTime: 0
};

function preload() {
  // 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  const objects = [];
  const tweens = [];
  
  // 创建10个圆形物体，排列成两行
  for (let i = 0; i < animationState.totalObjects; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = 150 + col * 120;
    const y = 200 + row * 200;
    
    // 创建精灵对象
    const circle = this.add.sprite(x, y, 'circle');
    circle.setTint(Phaser.Display.Color.GetColor(
      Math.random() * 255,
      Math.random() * 255,
      Math.random() * 255
    ));
    
    objects.push(circle);
    
    // 为每个物体创建淡入淡出动画
    const tween = this.tweens.add({
      targets: circle,
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(tween);
  }
  
  // 添加状态文本显示
  const statusText = this.add.text(400, 50, '', {
    fontSize: '24px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  const timerText = this.add.text(400, 100, '', {
    fontSize: '20px',
    fill: '#ffff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 更新状态文本
  const updateStatus = () => {
    statusText.setText(
      `Animation Status: ${animationState.isRunning ? 'RUNNING' : 'STOPPED'}\n` +
      `Objects: ${animationState.totalObjects}\n` +
      `Completed: ${animationState.completedCount}`
    );
    timerText.setText(
      `Elapsed Time: ${(animationState.elapsedTime / 1000).toFixed(2)}s / 4.00s`
    );
  };
  
  updateStatus();
  
  // 每帧更新计时器
  this.time.addEvent({
    delay: 16,
    callback: () => {
      if (animationState.isRunning) {
        animationState.elapsedTime += 16;
        updateStatus();
      }
    },
    loop: true
  });
  
  // 4秒后停止所有动画
  this.time.delayedCall(4000, () => {
    animationState.isRunning = false;
    animationState.elapsedTime = 4000;
    
    // 停止所有tween动画
    tweens.forEach(tween => {
      tween.stop();
      animationState.completedCount++;
    });
    
    updateStatus();
    
    // 添加完成提示
    this.add.text(400, 500, 'Animation Completed!', {
      fontSize: '32px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    console.log('Animation stopped after 4 seconds');
    console.log('Final state:', animationState);
  });
  
  // 添加说明文本
  this.add.text(400, 550, 'Watch the circles fade in and out for 4 seconds', {
    fontSize: '16px',
    fill: '#888888'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);