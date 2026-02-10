const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let score = 0;
let scoreText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建分数文本，定位到右上角
  scoreText = this.add.text(800, 10, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为右上角，便于对齐
  scoreText.setOrigin(1, 0);
  
  // 添加一些边距，让文本不贴边
  scoreText.setPosition(780, 20);
  
  // 创建定时器事件，每1秒（1000ms）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 1秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加视觉提示：显示定时器状态的指示器
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 1);
  graphics.strokeRect(10, 10, 200, 40);
  
  const infoText = this.add.text(20, 20, 'Auto +12 per second', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  
  // 添加一个视觉进度条显示定时器进度
  this.progressBar = this.add.graphics();
}

function update(time, delta) {
  // 可选：显示定时器进度
  if (timerEvent && this.progressBar) {
    const progress = timerEvent.getProgress();
    
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 0.5);
    this.progressBar.fillRect(10, 55, 200 * progress, 10);
  }
}

function addScore() {
  // 每次调用增加12分
  score += 12;
  
  // 更新分数文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：分数增加时闪烁效果
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
const game = new Phaser.Game(config);

// 导出分数变量供外部验证
if (typeof window !== 'undefined') {
  window.getScore = () => score;
}