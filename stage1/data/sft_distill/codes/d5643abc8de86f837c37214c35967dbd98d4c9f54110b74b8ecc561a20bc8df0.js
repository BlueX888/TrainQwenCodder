class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建分数文本，位置在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧留20像素边距
      20, // 顶部留20像素边距
      'Score: 0',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本原点为右上角，方便对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每2秒触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 2000, // 2秒 = 2000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便更好地看到文本
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 添加提示信息
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Score increases by 20 every 2 seconds',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 每次增加20分
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Score updated:', this.score);
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
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 game 实例以便外部验证
if (typeof window !== 'undefined') {
  window.game = game;
}