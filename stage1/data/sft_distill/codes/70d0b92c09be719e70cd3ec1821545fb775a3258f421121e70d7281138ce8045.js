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

let score = 0;
let scoreText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在屏幕右上角创建分数文本
  // x: 800 - 20 (右边距), y: 20 (上边距)
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'right'
  });
  
  // 设置文本的原点为右上角，便于右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 3000 毫秒（3秒）执行一次
  this.time.addEvent({
    delay: 3000,           // 延迟 3000ms
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加说明文本
  this.add.text(400, 300, 'Auto Score System\n+10 points every 3 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加当前分数的调试输出（可选）
  console.log('Score system initialized. Current score:', score);
}

function updateScore() {
  // 每次调用增加 10 分
  score += 10;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出到控制台便于验证
  console.log('Score updated:', score);
}

// 创建游戏实例
new Phaser.Game(config);