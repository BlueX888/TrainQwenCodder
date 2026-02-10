// 全局变量用于状态验证
let gameScore = 0;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化分数
    this.score = 0;
    gameScore = 0;

    // 创建分数文本，定位在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距20px
      20, // 上边距20px
      'Score: 0',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本原点为右上角，方便定位
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件，每1000毫秒（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 延迟1000毫秒
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加背景以便更好地看到文本
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // 将文本置于最上层
    this.scoreText.setDepth(1);
  }

  addScore() {
    // 每次加20分
    this.score += 20;
    gameScore = this.score;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 在控制台输出，方便调试验证
    console.log('Current Score:', this.score);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);