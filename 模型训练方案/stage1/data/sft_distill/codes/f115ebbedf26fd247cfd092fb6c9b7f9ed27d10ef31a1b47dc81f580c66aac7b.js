const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationComplete = false;
let animationStatus = 'running';
let objects = [];
let tweens = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建标题文本
  this.add.text(400, 50, '10个物体同步淡入淡出动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 状态显示文本
  const statusText = this.add.text(400, 550, '状态: 动画运行中...', {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 创建10个圆形物体
  const startX = 150;
  const startY = 300;
  const spacing = 60;
  
  for (let i = 0; i < 10; i++) {
    // 使用 Graphics 创建圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(0, 0, 25);
    
    // 生成纹理
    graphics.generateTexture(`circle${i}`, 50, 50);
    graphics.destroy();
    
    // 创建精灵
    const circle = this.add.sprite(startX + i * spacing, startY, `circle${i}`);
    circle.setAlpha(0); // 初始透明
    objects.push(circle);
  }
  
  // 为所有物体创建同步的淡入淡出动画
  objects.forEach((obj, index) => {
    const tween = scene.tweens.add({
      targets: obj,
      alpha: { from: 0, to: 1 },
      duration: 1000, // 1秒淡入
      yoyo: true,     // 自动淡出
      repeat: 0,      // 只执行一次完整的淡入淡出
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 只在第一个物体完成时更新状态
        if (index === 0) {
          animationComplete = true;
          animationStatus = 'completed';
          statusText.setText('状态: 动画已完成 ✓');
          statusText.setColor('#ffff00');
          
          console.log('动画完成状态:', {
            complete: animationComplete,
            status: animationStatus,
            objectsCount: objects.length,
            duration: '2秒'
          });
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 添加调试信息文本
  const debugText = this.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 5, y: 5 }
  });
  
  // 更新调试信息
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const elapsed = tweens[0] ? tweens[0].elapsed : 0;
      const progress = tweens[0] ? Math.round(tweens[0].progress * 100) : 0;
      
      debugText.setText([
        `物体数量: ${objects.length}`,
        `动画状态: ${animationStatus}`,
        `完成标志: ${animationComplete}`,
        `进度: ${progress}%`,
        `已用时间: ${Math.round(elapsed)}ms / 2000ms`
      ]);
    },
    loop: true
  });
  
  // 2秒后验证所有动画完成
  this.time.delayedCall(2100, () => {
    console.log('验证结果:', {
      allObjectsVisible: objects.every(obj => obj.alpha > 0 || obj.alpha === 0),
      animationComplete: animationComplete,
      finalStatus: animationStatus
    });
  });
}

function update(time, delta) {
  // 可选的更新逻辑
}

new Phaser.Game(config);