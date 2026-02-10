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
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(
    config.width - 20,  // x 坐标（右侧）
    20,                  // y 坐标（顶部）
    'Score: 0',         // 初始文本
    {
      fontSize: '80px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为右上角，使其从右侧对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 1000ms（1秒）执行一次
  this.time.addEvent({
    delay: 1000,              // 延迟时间（毫秒）
    callback: updateScore,    // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true                // 循环执行
  });
  
  // 添加提示文本（可选，用于说明功能）
  this.add.text(
    config.width / 2,
    config.height / 2,
    'Auto Score System\n+10 every second',
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffff00',
      align: 'center'
    }
  ).setOrigin(0.5);
}

// 更新分数的回调函数
function updateScore() {
  score += 10;
  scoreText.setText('Score: ' + score);
  
  // 输出到控制台以便验证
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);