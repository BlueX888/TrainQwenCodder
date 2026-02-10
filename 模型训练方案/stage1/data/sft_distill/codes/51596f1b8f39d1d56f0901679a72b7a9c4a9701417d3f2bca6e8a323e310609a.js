const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let score = 0;
let scoreText;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // x: 780 (右对齐，距离右边界 20px)
  // y: 20 (距离顶部 20px)
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'right'
  });
  
  // 设置文本原点为右上角，便于右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 2 秒（2000ms）加 8 分
  this.time.addEvent({
    delay: 2000,           // 2秒触发一次
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto-scoring system running\n+8 points every 2 seconds', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 输出初始状态用于验证
  console.log('Initial score:', score);
}

function updateScore() {
  // 增加分数
  score += 8;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出当前分数用于验证
  console.log('Current score:', score);
}

// 创建游戏实例
new Phaser.Game(config);