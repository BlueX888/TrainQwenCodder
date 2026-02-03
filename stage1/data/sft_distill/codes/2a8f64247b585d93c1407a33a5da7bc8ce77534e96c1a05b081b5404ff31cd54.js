const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局变量存储分数（用于验证）
let score = 0;
let scoreText = null;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化分数
  score = 0;
  
  // 在右上角创建分数文本
  // x: 800 - 20 (右边距), y: 20 (上边距)
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'right'
  });
  
  // 设置文本锚点为右上角，便于右对齐
  scoreText.setOrigin(1, 0);
  
  // 创建定时器：每 3 秒执行一次
  this.time.addEvent({
    delay: 3000,           // 3000 毫秒 = 3 秒
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Score auto-increases every 3 seconds', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 添加视觉反馈：绘制一个背景框
  const graphics = this.add.graphics();
  graphics.fillStyle(0x000000, 0.5);
  graphics.fillRoundedRect(680, 10, 110, 40, 5);
}

function updateScore() {
  // 增加分数
  score += 10;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加视觉反馈：短暂的缩放动画
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power1'
  });
  
  // 控制台输出，便于验证
  console.log('Score updated:', score);
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 启动游戏
new Phaser.Game(config);