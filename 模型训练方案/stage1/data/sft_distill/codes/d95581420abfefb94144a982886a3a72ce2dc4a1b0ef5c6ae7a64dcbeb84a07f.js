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
  // 创建分数文本，显示在右上角
  // 使用 setOrigin(1, 0) 使文本右对齐
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器，每2秒加15分
  this.time.addEvent({
    delay: 2000,           // 2秒 = 2000毫秒
    callback: addScore,    // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Score will increase by 15 every 2 seconds', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 添加视觉反馈：显示下次加分的倒计时指示器
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 1);
  graphics.strokeCircle(400, 400, 30);
  
  // 创建一个旋转的指示器来显示时间流逝
  const indicator = this.add.graphics();
  indicator.fillStyle(0x00ff00, 1);
  indicator.fillCircle(0, -30, 5);
  indicator.x = 400;
  indicator.y = 400;
  
  // 让指示器旋转，每2秒一圈
  this.tweens.add({
    targets: indicator,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
}

function addScore() {
  // 增加分数
  score += 15;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 添加闪烁效果作为视觉反馈
  this.tweens.add({
    targets: scoreText,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 100,
    yoyo: true,
    ease: 'Power2'
  });
  
  // 控制台输出，方便验证
  console.log('Score updated:', score);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 score 变量供验证
window.getScore = function() {
  return score;
};