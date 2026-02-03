class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证的状态变量
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 在右上角创建分数文本
    // 使用 originX: 1 让文本右对齐，便于固定在右上角
    this.scoreText = this.add.text(780, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.scoreText.setOrigin(1, 0); // 右上角对齐

    // 创建定时器事件，每 1000ms（1秒）触发一次
    this.scoreTimer = this.time.addEvent({
      delay: 1000,           // 延迟 1000ms
      callback: this.addScore, // 回调函数
      callbackScope: this,   // 回调函数的作用域
      loop: true             // 循环执行
    });

    // 添加背景色以便更好地观察
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);
    graphics.setDepth(-1); // 确保背景在最底层

    // 添加说明文本
    this.add.text(400, 300, 'Auto Score System\n+12 points per second', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
  }

  addScore() {
    // 每次调用增加 12 分
    this.score += 12;
    
    // 更新分数文本显示
    this.scoreText.setText('Score: ' + this.score);
    
    // 输出到控制台以便验证
    console.log('Current Score:', this.score);
  }

  update(time, delta) {
    // 本例中不需要 update 逻辑，但保留以展示完整生命周期
  }

  // 提供获取分数的方法，便于外部验证
  getScore() {
    return this.score;
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

// 导出 game 实例以便外部访问和验证
// 可通过 game.scene.getScene('GameScene').getScore() 获取当前分数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = game;
}