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

// 全局变量用于验证
let currentScore = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  this.score = 0;
  currentScore = 0;

  // 在右上角创建分数文本
  // 使用 origin(1, 0) 使文本右对齐，并留出边距
  this.scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  this.scoreText.setOrigin(1, 0); // 右上角对齐

  // 创建定时器事件：每 1000 毫秒（1秒）触发一次
  this.scoreTimer = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });

  // 添加提示文本
  this.add.text(400, 300, 'Auto-scoring: +12 per second', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  }).setOrigin(0.5);
}

// 加分回调函数
function addScore() {
  this.score += 12;
  currentScore = this.score;
  
  // 更新分数显示
  this.scoreText.setText('Score: ' + this.score);
  
  // 在控制台输出分数变化（便于验证）
  console.log('Score updated:', this.score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证接口（可选，用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getCurrentScore: () => currentScore };
}