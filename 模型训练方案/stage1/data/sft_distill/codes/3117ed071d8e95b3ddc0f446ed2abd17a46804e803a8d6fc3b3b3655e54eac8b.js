class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建分数文本，显示在右上角
    this.scoreText = this.add.text(
      this.cameras.main.width - 20, // 右边距 20px
      20, // 上边距 20px
      'Score: 0',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    // 设置文本右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每 2.5 秒（2500ms）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 2500,           // 延迟 2500ms
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调作用域
      loop: true             // 循环执行
    });

    // 添加提示信息（可选）
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Auto Score System\n+15 every 2.5s',
      {
        fontSize: '24px',
        color: '#00ff00',
        fontFamily: 'Arial',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  addScore() {
    // 增加分数
    this.score += 15;
    
    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 在控制台输出，便于验证
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

// 暴露 scene 供外部访问验证
window.getGameScene = function() {
  return game.scene.scenes[0];
};