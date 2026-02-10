const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let score = 0;
let scoreText = null;
let timerEvent = null;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // 使用 align: 'right' 和 x 坐标为 width - 20 实现右对齐
  scoreText = this.add.text(
    this.cameras.main.width - 20, 
    20, 
    'Score: 0', 
    {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'right'
    }
  );
  
  // 设置文本的原点为右上角，便于右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每 1.5 秒（1500ms）触发一次
  timerEvent = this.time.addEvent({
    delay: 1500,              // 延迟 1500 毫秒
    callback: addScore,       // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true                // 循环执行
  });
  
  // 添加说明文本
  this.add.text(
    this.cameras.main.width / 2,
    this.cameras.main.height / 2,
    'Auto Score System\n\n+3 points every 1.5 seconds',
    {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      align: 'center'
    }
  ).setOrigin(0.5);
}

function addScore() {
  // 每次调用增加 3 分
  score += 3;
  
  // 更新分数文本显示
  scoreText.setText('Score: ' + score);
  
  // 可选：添加视觉反馈效果
  scoreText.setScale(1.2);
  this.tweens.add({
    targets: scoreText,
    scale: 1,
    duration: 200,
    ease: 'Back.out'
  });
}

function update(time, delta) {
  // 不需要每帧更新逻辑，定时器会自动触发
}

// 创建游戏实例
new Phaser.Game(config);