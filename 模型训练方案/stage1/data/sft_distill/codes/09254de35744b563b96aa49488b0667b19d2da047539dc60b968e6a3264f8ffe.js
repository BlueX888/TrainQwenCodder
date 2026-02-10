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
  
  // 创建分数文本，显示在右上角
  // originX: 1 表示右对齐，这样文本从右边界向左绘制
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每1.5秒触发一次
  this.time.addEvent({
    delay: 1500,           // 1.5秒 = 1500毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true            // 循环执行
  });
  
  // 添加视觉提示文字
  this.add.text(400, 300, 'Auto Score System\n+3 every 1.5 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加当前时间显示（可选，用于验证定时器工作）
  const timeText = this.add.text(20, 20, '', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  
  // 每帧更新时间显示
  this.events.on('update', () => {
    timeText.setText('Time: ' + Math.floor(this.time.now / 1000) + 's');
  });
}

function addScore() {
  // 每次调用增加3分
  score += 3;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加一个简单的视觉反馈：文本闪烁效果
  scoreText.setScale(1.2);
  this.tweens.add({
    targets: scoreText,
    scaleX: 1,
    scaleY: 1,
    duration: 200,
    ease: 'Power2'
  });
  
  // 在控制台输出，方便验证
  console.log('Score updated:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { score, game };
}