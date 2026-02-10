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
  // 使用 setOrigin(1, 0) 将锚点设置为右上角，便于定位
  scoreText = this.add.text(780, 20, 'Score: 0', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  scoreText.setOrigin(1, 0); // 右上角对齐
  
  // 创建定时器事件，每1秒（1000毫秒）执行一次
  this.time.addEvent({
    delay: 1000,           // 延迟1000毫秒
    callback: updateScore, // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
  
  // 添加提示文本
  this.add.text(400, 300, 'Auto Score System\n+12 points per second', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
}

function updateScore() {
  // 每次调用增加12分
  score += 12;
  
  // 更新文本显示
  scoreText.setText('Score: ' + score);
  
  // 输出到控制台以便验证
  console.log('Current Score:', score);
}

// 创建游戏实例
new Phaser.Game(config);