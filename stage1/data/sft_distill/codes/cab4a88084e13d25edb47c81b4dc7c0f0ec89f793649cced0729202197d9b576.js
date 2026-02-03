const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局变量用于验证状态
let score = 0;
let scoreText;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在屏幕右上角
  scoreText = this.add.text(
    780, // x 位置（右侧）
    20,  // y 位置（顶部）
    `Score: ${score}`, 
    {
      fontSize: '80px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本右对齐（以右上角为锚点）
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 2 秒加 20 分
  this.time.addEvent({
    delay: 2000,           // 2000 毫秒 = 2 秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(
    400,
    300,
    'Score increases by 20 every 2 seconds',
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }
  ).setOrigin(0.5);
}

function addScore() {
  // 增加分数
  score += 20;
  
  // 更新文本显示
  scoreText.setText(`Score: ${score}`);
  
  // 控制台输出用于验证
  console.log(`Score updated: ${score}`);
}

function update(time, delta) {
  // 本例无需 update 逻辑
}

// 启动游戏
new Phaser.Game(config);