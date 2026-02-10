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
  // 不需要预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(
    800 - 20, // x坐标：屏幕宽度减去右边距
    20,       // y坐标：顶部边距
    'Score: 0',
    {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为右上角，便于对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,           // 延迟2500毫秒 = 2.5秒
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加提示文本
  this.add.text(
    400,
    300,
    'Score will increase by 5\nevery 2.5 seconds',
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#888888',
      align: 'center'
    }
  ).setOrigin(0.5);
}

function updateScore() {
  // 分数增加5
  score += 5;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 在控制台输出当前分数（便于验证）
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);