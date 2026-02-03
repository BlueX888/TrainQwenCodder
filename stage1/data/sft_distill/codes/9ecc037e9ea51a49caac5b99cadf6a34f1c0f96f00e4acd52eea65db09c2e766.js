const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  
  // 在右上角创建分数文本
  // x: 800 - 10 (右边距), y: 10 (上边距)
  // origin(1, 0) 表示以右上角为锚点
  scoreText = this.add.text(790, 10, 'Score: 0', {
    fontSize: '16px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  scoreText.setOrigin(1, 0); // 右对齐
  
  // 创建定时器事件：每 3 秒加 10 分
  this.time.addEvent({
    delay: 3000,           // 3秒 = 3000毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加提示文本（可选，方便观察）
  this.add.text(10, 10, 'Score increases by 10 every 3 seconds', {
    fontSize: '14px',
    color: '#cccccc',
    fontFamily: 'Arial'
  });
}

function addScore() {
  // 每次调用增加 10 分
  score += 10;
  
  // 更新分数显示
  scoreText.setText('Score: ' + score);
  
  // 在控制台输出，方便验证
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);