const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let score = 0;
let scoreText;
let timerEvent;

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为右上角，便于对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器事件：每2秒加3分
  timerEvent = this.time.addEvent({
    delay: 2000,           // 2秒 = 2000毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  const hintText = this.add.text(400, 300, 'Score increases by 3 every 2 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);
  
  // 添加装饰性背景图形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x4a4a4a, 0.5);
  graphics.fillRoundedRect(650, 10, 140, 80, 10);
}

function addScore() {
  // 每次调用增加3分
  score += 3;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加缩放动画效果，增强视觉反馈
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
}

function update(time, delta) {
  // 本例中无需每帧更新逻辑
}

// 创建游戏实例
new Phaser.Game(config);