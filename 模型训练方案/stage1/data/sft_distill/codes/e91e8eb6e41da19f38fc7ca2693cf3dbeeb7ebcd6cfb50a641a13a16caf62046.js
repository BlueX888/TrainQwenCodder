// 完整的 Phaser3 收集游戏代码
class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.collectedCount = 0;
    this.totalDiamonds = 3;
    this.gameOver = false;
  }

  preload() {
    // 使用 Graphics 程序化生成纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      collectedCount: 0,
      totalDiamonds: 3,
      gameCompleted: false,
      playerPosition: { x: 0, y: 0 }
    };

    // 创建玩家纹理（圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建菱形纹理
    const diamondGraphics = this.add.graphics();
    diamondGraphics.fillStyle(0xffff00, 1);
    diamondGraphics.beginPath();
    diamondGraphics.moveTo(15, 0);
    diamondGraphics.lineTo(30, 15);
    diamondGraphics.lineTo(15, 30);
    diamondGraphics.lineTo(0, 15);
    diamondGraphics.closePath();
    diamondGraphics.fillPath();
    diamondGraphics.generateTexture('diamond', 30, 30);
    diamondGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建菱形收集物组
    this.diamonds = this.physics.add.group();

    // 随机生成3个菱形
    for (let i = 0; i < this.totalDiamonds; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const diamond = this.diamonds.create(x, y, 'diamond');
      diamond.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.diamonds,
      this.collectDiamond,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalDiamonds}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now(),
      totalDiamonds: this.totalDiamonds
    }));
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }

  collectDiamond(player, diamond) {
    // 销毁菱形
    diamond.destroy();

    // 增加收集计数
    this.collectedCount++;
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalDiamonds}`);

    // 更新信号
    window.__signals__.collectedCount = this.collectedCount;

    console.log(JSON.stringify({
      event: 'diamond_collected',
      timestamp: Date.now(),
      collectedCount: this.collectedCount,
      totalDiamonds: this.totalDiamonds
    }));

    // 检查是否收集完成
    if (this.collectedCount >= this.totalDiamonds) {
      this.gameComplete();
    }
  }

  gameComplete() {
    this.gameOver = true;
    this.winText.setVisible(true);
    this.player.setVelocity(0);

    // 更新信号
    window.__signals__.gameCompleted = true;

    console.log(JSON.stringify({
      event: 'game_completed',
      timestamp: Date.now(),
      collectedCount: this.collectedCount,
      success: true
    }));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectGameScene
};

// 创建游戏实例
new Phaser.Game(config);