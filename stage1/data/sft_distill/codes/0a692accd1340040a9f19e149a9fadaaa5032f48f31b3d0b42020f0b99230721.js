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
  // 使用 origin(1, 0) 使文本右对齐，方便定位在右上角
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器：每1秒（1000ms）执行一次
  this.time.addEvent({
    delay: 1000,           // 延迟1000毫秒（1秒）
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
  });
  
  // 添加说明文本
  this.add.text(400, 300, 'Auto Score System\n+20 every second', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

function updateScore() {
  // 每次调用增加20分
  score += 20;
  
  // 更新显示文本
  scoreText.setText('Score: ' + score);
  
  // 在控制台输出当前分数（用于验证）
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);