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
  // 不需要预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // 使用 setOrigin(1, 0) 将锚点设置为右上角，便于定位
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右对齐
  
  // 创建定时器事件：每3秒（3000毫秒）触发一次
  this.time.addEvent({
    delay: 3000,           // 延迟时间（毫秒）
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Score increases by 20 every 3 seconds', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 加分回调函数
function addScore() {
  score += 20;
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：文本闪烁效果
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 在控制台输出，方便验证
  console.log('Score updated:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出 score 变量供外部验证
if (typeof window !== 'undefined') {
  window.getScore = () => score;
}