const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let score = 0;
let scoreText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在屏幕右上角
  // 使用 setOrigin(1, 0) 使文本右对齐，方便定位在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每1000ms（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒间隔
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Score Auto-Incrementing\n+12 per second', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 显示定时器信息（用于调试验证）
  const debugText = this.add.text(20, 20, '', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffff00'
  });
  
  // 每帧更新调试信息
  this.events.on('update', () => {
    if (timerEvent) {
      const elapsed = timerEvent.getElapsed();
      const remaining = timerEvent.getRemaining();
      debugText.setText([
        `Timer Elapsed: ${Math.floor(elapsed)}ms`,
        `Timer Remaining: ${Math.floor(remaining)}ms`,
        `Repeat Count: ${timerEvent.repeatCount}`
      ]);
    }
  });
}

function addScore() {
  // 每次调用增加12分
  score += 12;
  
  // 更新分数文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加简单的缩放动画效果，让分数变化更明显
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Quad.easeOut'
  });
}

function update(time, delta) {
  // 本示例中 update 不需要特殊逻辑
  // 分数更新由定时器事件驱动
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 score 变量用于外部验证
window.getScore = () => score;