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
  // x: 750 (靠右), y: 30 (顶部), 字体大小 24
  scoreText = this.add.text(750, 30, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本右对齐（originX: 1 表示以右边为锚点）
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 0.5 秒（500 毫秒）执行一次
  this.time.addEvent({
    delay: 500,              // 延迟时间（毫秒）
    callback: addScore,      // 回调函数
    callbackScope: this,     // 回调函数的作用域
    loop: true               // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto Score System\n+5 every 0.5 seconds', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

// 加分函数
function addScore() {
  score += 5;
  scoreText.setText('Score: ' + score);
  
  // 在控制台输出当前分数（便于验证）
  console.log('Current score:', score);
}

// 创建游戏实例
new Phaser.Game(config);