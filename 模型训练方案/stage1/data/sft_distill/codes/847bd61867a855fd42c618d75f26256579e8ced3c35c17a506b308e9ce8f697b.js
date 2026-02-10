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
let scoreText = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // x: 800 - 10 (右边距), y: 10 (顶部边距)
  // originX: 1 表示文本右对齐，这样文本会从右向左增长
  scoreText = this.add.text(790, 10, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器：每 3 秒加 3 分
  this.time.addEvent({
    delay: 3000,              // 3000 毫秒 = 3 秒
    callback: addScore,       // 回调函数
    callbackScope: this,      // 回调函数的作用域
    loop: true                // 循环执行
  });
  
  // 添加提示文本
  const hintText = this.add.text(400, 300, 'Score increases by 3 every 3 seconds', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  });
  hintText.setOrigin(0.5);
  
  // 添加视觉反馈：创建一个脉动的圆形指示器
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 0.3);
  graphics.fillCircle(400, 400, 50);
  
  // 让圆形脉动以显示时间流逝
  this.tweens.add({
    targets: graphics,
    alpha: 0.1,
    scale: 1.2,
    duration: 1500,
    yoyo: true,
    repeat: -1
  });
}

/**
 * 加分函数：每次调用增加 3 分并更新显示
 */
function addScore() {
  score += 3;
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：文本闪烁效果
  scoreText.setScale(1.3);
  this.tweens.add({
    targets: scoreText,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
  
  // 在控制台输出，便于验证
  console.log('Score updated:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量以便外部验证
if (typeof window !== 'undefined') {
  window.getScore = () => score;
}