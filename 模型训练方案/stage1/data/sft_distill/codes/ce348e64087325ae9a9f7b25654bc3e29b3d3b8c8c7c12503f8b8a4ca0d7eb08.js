const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let score = 0;
let scoreText;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  // 使用 setOrigin(1, 0) 使文本右对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 延迟1000毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加说明文本
  this.add.text(400, 300, 'Score increases by 20 every second', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  }).setOrigin(0.5);
  
  // 添加可视化进度条（可选，用于展示定时器进度）
  this.progressBar = this.add.graphics();
}

function update(time, delta) {
  // 绘制定时器进度条（可选的可视化效果）
  if (timerEvent) {
    const progress = timerEvent.getProgress();
    
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 0.3);
    this.progressBar.fillRect(100, 500, 600 * progress, 20);
    
    this.progressBar.lineStyle(2, 0x00ff00, 1);
    this.progressBar.strokeRect(100, 500, 600, 20);
  }
}

function addScore() {
  // 每次调用增加20分
  score += 20;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加简单的缩放动画效果
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 输出到控制台便于验证
  console.log('Score updated:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露分数变量以便外部验证
window.getScore = function() {
  return score;
};