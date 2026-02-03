const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 验证状态变量
let animationComplete = false;
let activeObjects = 12;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const objects = [];
  const startX = 150;
  const startY = 150;
  const spacingX = 150;
  const spacingY = 150;
  
  // 创建12个物体（3行4列）
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      // 使用Graphics绘制圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ff88, 1);
      graphics.fillCircle(0, 0, 30);
      graphics.x = x;
      graphics.y = y;
      graphics.alpha = 0; // 初始透明度为0
      
      objects.push(graphics);
    }
  }
  
  // 为所有物体添加同步的淡入淡出动画
  objects.forEach(obj => {
    this.tweens.add({
      targets: obj,
      alpha: { from: 0, to: 1 },
      duration: 1000,
      yoyo: true, // 自动反向播放（淡出）
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut'
    });
  });
  
  // 4秒后停止所有动画
  this.time.delayedCall(4000, () => {
    // 停止所有Tween动画
    this.tweens.killAll();
    
    // 设置所有物体为完全可见状态
    objects.forEach(obj => {
      obj.alpha = 1;
    });
    
    // 设置验证状态
    animationComplete = true;
    activeObjects = objects.length;
    
    // 添加完成提示文本
    const text = this.add.text(400, 50, 'Animation Complete!', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    
    // 添加状态信息文本
    const statusText = this.add.text(400, 550, 
      `Status: Complete | Active Objects: ${activeObjects}`, {
      fontSize: '20px',
      color: '#00ff88'
    });
    statusText.setOrigin(0.5);
    
    console.log('Animation completed after 4 seconds');
    console.log('animationComplete:', animationComplete);
    console.log('activeObjects:', activeObjects);
  });
  
  // 添加初始说明文本
  const instructionText = this.add.text(400, 50, 'Synchronized Fade Animation (4s)', {
    fontSize: '24px',
    color: '#ffffff'
  });
  instructionText.setOrigin(0.5);
}

function update(time, delta) {
  // 可以在这里添加额外的逻辑
  // 当前示例不需要每帧更新
}

new Phaser.Game(config);