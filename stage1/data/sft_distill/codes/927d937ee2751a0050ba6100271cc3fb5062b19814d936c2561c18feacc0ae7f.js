class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.collectibles = null;
    this.cursors = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建可收集物体纹理（橙色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffa500, 1);
    collectibleGraphics.fillCircle(15, 15, 15);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建可收集物体组
    this.collectibles = this.physics.add.group();

    // 随机生成10个可收集物体
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 400);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(15); // 设置圆形碰撞体
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectItem(player, collectible) {
    // 移除被收集的物体
    collectible.destroy();

    // 增加分数
    this.score += 10;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有物体
    if (this.collectibles.countActive(true) === 0) {
      this.scoreText.setText('Score: ' + this.score + ' - YOU WIN!');
    }
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
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);