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
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本显示在右上角
  // 使用 originX: 1 让文本右对齐，便于定位在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件：每 0.5 秒（500 毫秒）执行一次
  this.time.addEvent({
    delay: 500,              // 延迟 500ms
    callback: updateScore,   // 回调函数
    callbackScope: this,     // 回调作用域
    loop: true               // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto Score System\n+10 every 0.5s', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

function updateScore() {
  // 每次调用增加 10 分
  score += 10;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出到控制台用于验证
  console.log('Current Score:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量用于验证
if (typeof window !== 'undefined') {
  window.gameScore = () => score;
}