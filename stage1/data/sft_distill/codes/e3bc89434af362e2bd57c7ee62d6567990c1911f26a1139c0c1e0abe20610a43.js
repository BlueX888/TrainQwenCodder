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
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 创建分数文本，显示在右上角
  // 使用 originX: 1 让文本从右侧对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每1.5秒（1500毫秒）触发一次
  this.time.addEvent({
    delay: 1500,           // 延迟时间（毫秒）
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加视觉提示：显示计时器进度条（可选，用于验证定时器工作）
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 1);
  graphics.strokeRect(20, 20, 200, 20);
  
  this.add.text(20, 50, 'Auto +10 every 1.5s', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
}

// 加分函数
function addScore() {
  score += 10;
  scoreText.setText('Score: ' + score);
  
  // 添加简单的视觉反馈：文本缩放动画
  scoreText.setScale(1.2);
  this.tweens.add({
    targets: scoreText,
    scaleX: 1,
    scaleY: 1,
    duration: 200,
    ease: 'Power2'
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出score变量用于验证（可在控制台访问）
if (typeof window !== 'undefined') {
  window.getScore = () => score;
}