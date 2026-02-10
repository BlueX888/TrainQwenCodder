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
let gameState = {
  isAnimating: true,
  animationTime: 0,
  objectsCount: 5
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文字
  const titleText = this.add.text(400, 50, '同步淡入淡出动画', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态显示文字
  const statusText = this.add.text(400, 100, '动画进行中...', {
    fontSize: '20px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 定义5个物体的颜色和位置
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const objects = [];
  const tweens = [];
  
  // 创建5个矩形物体
  for (let i = 0; i < 5; i++) {
    const x = 150 + i * 130;
    const y = 300;
    
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(0, 0, 100, 100);
    graphics.x = x;
    graphics.y = y;
    
    // 添加物体编号文字
    const label = this.add.text(x + 50, y + 50, `${i + 1}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    objects.push({ graphics, label });
    
    // 为每个物体创建淡入淡出 Tween
    const tween = this.tweens.add({
      targets: [graphics, label],
      alpha: { from: 1, to: 0.1 },
      duration: 1000, // 1秒淡出
      yoyo: true, // 自动淡入
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(tween);
  }
  
  // 添加计时器文字
  const timerText = this.add.text(400, 500, '剩余时间: 3.0s', {
    fontSize: '24px',
    color: '#ffaa00'
  }).setOrigin(0.5);
  
  // 创建倒计时变量
  let remainingTime = 3.0;
  
  // 每帧更新计时器显示
  const updateTimer = this.time.addEvent({
    delay: 50, // 每50毫秒更新一次
    callback: () => {
      remainingTime -= 0.05;
      if (remainingTime > 0) {
        timerText.setText(`剩余时间: ${remainingTime.toFixed(1)}s`);
        gameState.animationTime = (3.0 - remainingTime).toFixed(1);
      }
    },
    loop: true
  });
  
  // 3秒后停止所有动画
  this.time.delayedCall(3000, () => {
    // 停止所有 Tween
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 将所有物体的 alpha 设置为完全可见
    objects.forEach(obj => {
      obj.graphics.setAlpha(1);
      obj.label.setAlpha(1);
    });
    
    // 更新状态
    gameState.isAnimating = false;
    gameState.animationTime = 3.0;
    
    // 更新状态文字
    statusText.setText('动画已停止');
    statusText.setColor('#ff0000');
    timerText.setText('动画完成！');
    timerText.setColor('#00ff00');
    
    // 停止计时器更新
    updateTimer.remove();
    
    // 添加完成提示
    const completeText = this.add.text(400, 450, '✓ 所有物体已同步完成动画', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
    
    // 完成文字淡入效果
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
    
    // 在控制台输出状态
    console.log('动画状态:', gameState);
  });
  
  // 添加说明文字
  this.add.text(400, 550, '5个物体将同步淡入淡出，3秒后自动停止', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
  
  // 初始化状态
  console.log('动画开始，初始状态:', gameState);
}

// 创建游戏实例
new Phaser.Game(config);