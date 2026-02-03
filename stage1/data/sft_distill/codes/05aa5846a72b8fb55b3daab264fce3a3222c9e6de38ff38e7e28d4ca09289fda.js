class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘20像素
      20, // 距离顶部20像素
      'Score: 0',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本原点为右上角，便于右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每0.5秒（500毫秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 500,           // 延迟500毫秒
      callback: this.addScore,  // 回调函数
      callbackScope: this,  // 回调函数的作用域
      loop: true            // 循环执行
    });

    // 添加背景色以便更好地看到分数
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // 将分数文本置于最上层
    this.scoreText.setDepth(1);

    // 输出初始状态用于验证
    console.log('Initial score:', this.score);
  }

  addScore() {
    // 每次调用增加12分
    this.score += 12;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出当前分数用于验证
    console.log('Current score:', this.score);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);