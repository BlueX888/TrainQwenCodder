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
  // 无需预加载资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // 使用 originX: 1 让文本右对齐，方便定位在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每 0.5 秒（500 毫秒）触发一次
  this.time.addEvent({
    delay: 500,           // 延迟时间：500ms
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加视觉提示：显示说明文字
  this.add.text(400, 300, 'Auto Score System\n+10 every 0.5s', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加装饰性图形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 0.3);
  graphics.fillRoundedRect(650, 10, 140, 70, 10);
}

function updateScore() {
  // 每次调用增加 10 分
  score += 10;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加简单的缩放动画效果，让加分更明显
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量用于验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, game };
}