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
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为右上角，便于右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件，每1秒触发一次
  this.time.addEvent({
    delay: 1000,           // 1秒 = 1000毫秒
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示信息
  this.add.text(400, 300, 'Score increases by 12 every second', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function updateScore() {
  // 每次调用增加12分
  score += 12;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出到控制台以便验证
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);