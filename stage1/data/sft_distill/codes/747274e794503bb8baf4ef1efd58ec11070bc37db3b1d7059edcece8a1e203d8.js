const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  animationState: 'idle',
  activeObjects: 0,
  elapsedTime: 0,
  isBouncing: false,
  completedAt: null
};

let objects = [];
let tweens = [];
let startTime = 0;
let animationDuration = 3000; // 3秒

function preload() {
  // 使用Graphics创建纹理
  const graphics = this.add.graphics();
  
  // 创建圆形纹理
  graphics.fillStyle(0x00ff88, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('ball', 50, 50);
  graphics.destroy();
  
  console.log('[PRELOAD] 纹理生成完成');
}

function create() {
  console.log('[CREATE] 开始创建场景');
  
  // 创建标题文本
  this.add.text(400, 50, '同步弹跳动画', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 创建状态文本
  this.statusText = this.add.text(400, 100, '状态: 准备中', {
    fontSize: '20px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 创建倒计时文本
  this.timerText = this.add.text(400, 550, '剩余时间: 3.00s', {
    fontSize: '24px',
    color: '#00ffff'
  }).setOrigin(0.5);
  
  // 计算物体间距
  const objectCount = 10;
  const spacing = 70;
  const startX = 400 - (spacing * (objectCount - 1)) / 2;
  const baseY = 300;
  
  // 创建10个物体
  for (let i = 0; i < objectCount; i++) {
    const x = startX + i * spacing;
    const obj = this.add.sprite(x, baseY, 'ball');
    obj.setScale(0.8);
    objects.push(obj);
  }
  
  console.log(`[CREATE] 创建了 ${objects.length} 个物体`);
  
  // 更新信号
  window.__signals__.activeObjects = objects.length;
  window.__signals__.animationState = 'ready';
  
  // 延迟0.5秒后开始动画
  this.time.delayedCall(500, () => {
    startBounceAnimation.call(this);
  });
}

function startBounceAnimation() {
  console.log('[ANIMATION] 开始弹跳动画');
  
  startTime = this.time.now;
  window.__signals__.animationState = 'running';
  window.__signals__.isBouncing = true;
  window.__signals__.elapsedTime = 0;
  
  this.statusText.setText('状态: 弹跳中');
  this.statusText.setColor('#00ff00');
  
  // 为每个物体创建同步的弹跳Tween
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      y: obj.y - 120, // 向上弹跳120像素
      duration: 500, // 单次弹跳持续500ms
      ease: 'Sine.easeInOut',
      yoyo: true, // 自动返回
      repeat: -1, // 无限循环
      onStart: () => {
        if (index === 0) {
          console.log('[TWEEN] 第一个物体开始弹跳');
        }
      }
    });
    
    tweens.push(tween);
  });
  
  // 3秒后停止所有动画
  this.time.delayedCall(animationDuration, () => {
    stopBounceAnimation.call(this);
  });
  
  console.log(`[ANIMATION] ${tweens.length} 个Tween已创建`);
}

function stopBounceAnimation() {
  console.log('[ANIMATION] 停止弹跳动画');
  
  // 停止所有Tween
  tweens.forEach(tween => {
    tween.stop();
  });
  
  // 将所有物体平滑返回原位
  objects.forEach(obj => {
    this.tweens.add({
      targets: obj,
      y: 300,
      duration: 300,
      ease: 'Cubic.easeOut'
    });
  });
  
  // 更新状态
  window.__signals__.animationState = 'completed';
  window.__signals__.isBouncing = false;
  window.__signals__.completedAt = this.time.now;
  
  this.statusText.setText('状态: 已完成');
  this.statusText.setColor('#ff00ff');
  this.timerText.setText('动画已结束');
  
  // 输出最终信号
  console.log('[SIGNALS] 最终状态:', JSON.stringify(window.__signals__, null, 2));
  
  // 显示完成提示
  const completeText = this.add.text(400, 400, '动画完成！', {
    fontSize: '28px',
    color: '#ffff00',
    fontStyle: 'bold'
  }).setOrigin(0.5).setAlpha(0);
  
  this.tweens.add({
    targets: completeText,
    alpha: 1,
    duration: 500,
    ease: 'Power2'
  });
}

function update(time, delta) {
  // 更新运行时间
  if (window.__signals__.isBouncing && startTime > 0) {
    const elapsed = time - startTime;
    window.__signals__.elapsedTime = elapsed;
    
    const remaining = Math.max(0, (animationDuration - elapsed) / 1000);
    this.timerText.setText(`剩余时间: ${remaining.toFixed(2)}s`);
    
    // 倒计时颜色变化
    if (remaining < 1) {
      this.timerText.setColor('#ff0000');
    } else if (remaining < 2) {
      this.timerText.setColor('#ffaa00');
    }
  }
}

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log('[INIT] 游戏初始化完成');
console.log('[SIGNALS] 初始状态:', JSON.stringify(window.__signals__, null, 2));