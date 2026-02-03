// 自动加分系统实现
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals 对象用于验证
    window.__signals__ = {
      score: this.score,
      lastUpdateTime: 0,
      updateCount: 0
    };

    // 创建分数文本，显示在右上角
    // 使用 originX: 1 使文本右对齐，便于定位在右上角
    this.scoreText = this.add.text(780, 20, `Score: ${this.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每1秒触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 1秒 = 1000毫秒
      callback: this.addScore,
      callbackScope: this,
      loop: true             // 循环执行
    });

    // 输出初始状态日志
    console.log(JSON.stringify({
      event: 'game_start',
      score: this.score,
      timestamp: Date.now()
    }));
  }

  addScore() {
    // 增加分数
    this.score += 5;

    // 更新文本显示
    this.scoreText.setText(`Score: ${this.score}`);

    // 更新 signals 对象
    window.__signals__.score = this.score;
    window.__signals__.lastUpdateTime = Date.now();
    window.__signals__.updateCount++;

    // 输出验证日志
    console.log(JSON.stringify({
      event: 'score_update',
      score: this.score,
      updateCount: window.__signals__.updateCount,
      timestamp: Date.now()
    }));
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
new Phaser.Game(config);