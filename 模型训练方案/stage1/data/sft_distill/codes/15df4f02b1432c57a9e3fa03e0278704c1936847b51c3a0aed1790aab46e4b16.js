class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右侧位置
      20, // 顶部位置
      'Score: 0',
      {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    
    // 设置文本锚点为右上角，使其从右侧对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器事件：每 4 秒增加 10 分
    this.timerEvent = this.time.addEvent({
      delay: 4000, // 4秒（4000毫秒）
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景以便更好地查看效果
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setDepth(-1); // 确保背景在最底层
  }

  addScore() {
    // 增加分数
    this.score += 10;
    
    // 更新分数文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本例中不需要每帧更新逻辑
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

// 暴露 score 以便外部验证
window.getScore = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.score : 0;
};