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
      `Score: ${this.score}`,
      {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    
    // 设置文本原点为右上角，便于右对齐
    this.scoreText.setOrigin(1, 0);

    // 创建定时器，每 3 秒自动加分
    this.scoreTimer = this.time.addEvent({
      delay: 3000, // 3000 毫秒 = 3 秒
      callback: this.addScore,
      callbackScope: this,
      loop: true // 循环执行
    });

    // 添加调试信息（可选）
    console.log('自动加分系统已启动：每3秒 +20 分');
  }

  addScore() {
    // 增加分数
    this.score += 20;
    
    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);
    
    // 输出日志便于验证
    console.log(`当前分数: ${this.score}`);
  }

  update(time, delta) {
    // 本例无需每帧更新逻辑
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
new Phaser.Game(config);