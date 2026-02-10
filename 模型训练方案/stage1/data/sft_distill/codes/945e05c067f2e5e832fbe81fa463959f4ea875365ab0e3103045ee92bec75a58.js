const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
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
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(
    config.width - 20, // x 位置（右侧）
    20,                 // y 位置（顶部）
    'Score: 0',         // 初始文本
    {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为右上角，使其从右侧对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器：每 3 秒加 20 分
  timerEvent = this.time.addEvent({
    delay: 3000,           // 3000 毫秒 = 3 秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(
    config.width / 2,
    config.height / 2,
    'Score increases by 20\nevery 3 seconds',
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }
  ).setOrigin(0.5);
  
  // 添加调试信息显示（可选）
  const debugText = this.add.text(
    20,
    config.height - 40,
    'Timer active',
    {
      fontSize: '20px',
      color: '#ffff00'
    }
  );
}

function addScore() {
  // 增加分数
  score += 20;
  
  // 更新分数文本
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：短暂缩放效果
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 150,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 控制台输出，便于验证
  console.log('Score updated:', score);
}

function update(time, delta) {
  // 本例中不需要每帧更新逻辑
  // 分数更新由定时器控制
}

// 创建游戏实例
new Phaser.Game(config);