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

// 全局变量存储分数（用于验证）
let score = 0;
let scoreText = null;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  // 使用 originX: 1 让文本右对齐，方便定位到右上角
  scoreText = this.add.text(
    780, // x 位置（800 - 20 的右边距）
    20,  // y 位置（顶部边距）
    'Score: 0',
    {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为右上角，方便对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 1000ms（1秒）触发一次
  this.time.addEvent({
    delay: 1000,           // 延迟时间（毫秒）
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(
    400,
    300,
    'Auto Score System\n+8 points every second',
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }
  ).setOrigin(0.5);
}

// 加分回调函数
function addScore() {
  score += 8;
  scoreText.setText('Score: ' + score);
  
  // 在控制台输出，方便验证
  console.log('Current Score:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);