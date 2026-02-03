class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 在右上角创建分数文本
    // 使用 originX: 1 实现右对齐
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 距离右边缘 20 像素
      20, // 距离顶部 20 像素
      'Score: 0',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器，每 2.5 秒加 15 分
    this.time.addEvent({
      delay: 2500, // 2.5 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加背景色以便观察（可选）
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 在控制台输出初始状态
    console.log('Game started. Initial score:', this.score);
  }

  addScore() {
    // 每次加 15 分
    this.score += 15;
    
    // 更新文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Score updated:', this.score);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: GameScene,
  backgroundColor: '#000000'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露 score 供外部验证（可选）
window.getScore = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.score : 0;
};