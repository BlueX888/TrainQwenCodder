const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

let scoreText;
let score = 0;

function preload() {
  // 无需加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在场景上添加 score 属性用于状态验证
  this.score = score;
  
  // 创建分数文本，显示在右上角
  // 使用 originX: 1 让文本右对齐，便于定位到右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件：每 2 秒（2000ms）触发一次
  this.time.addEvent({
    delay: 2000,           // 延迟时间（毫秒）
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加背景以便更好地看到分数文本
  const graphics = this.add.graphics();
  graphics.fillStyle(0x222222, 1);
  graphics.fillRect(0, 0, 800, 600);
  
  // 将文本置于最上层
  scoreText.setDepth(1);
  
  // 添加提示信息
  this.add.text(400, 300, 'Score auto-increments every 2 seconds', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00'
  }).setOrigin(0.5);
}

function addScore() {
  // 每次增加 15 分
  score += 15;
  
  // 更新场景的 score 属性（用于状态验证）
  this.scene.score = score;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 可选：添加简单的视觉反馈
  this.tweens.add({
    targets: scoreText,
    scale: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
}

const game = new Phaser.Game(config);

// 导出 score 用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, getScore: () => score };
}