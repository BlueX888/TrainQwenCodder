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
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // x: 800 - 20 (右边距), y: 20 (上边距)
  // originX: 1 让文本右对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器：每3秒（3000毫秒）执行一次
  this.time.addEvent({
    delay: 3000,           // 3秒延迟
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto Score System\n+3 points every 3 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加视觉反馈：显示倒计时指示器
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 1);
  graphics.strokeCircle(400, 450, 30);
  
  // 创建一个旋转的指示器来显示时间流逝
  const indicator = this.add.graphics();
  indicator.fillStyle(0x00ff00, 1);
  indicator.fillCircle(0, -30, 5);
  indicator.x = 400;
  indicator.y = 450;
  
  // 让指示器每3秒旋转一圈
  this.tweens.add({
    targets: indicator,
    angle: 360,
    duration: 3000,
    repeat: -1,
    ease: 'Linear'
  });
}

function addScore() {
  // 增加分数
  score += 3;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：文本缩放动画
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 控制台输出，便于验证
  console.log('Score updated:', score);
}

// 创建游戏实例
new Phaser.Game(config);