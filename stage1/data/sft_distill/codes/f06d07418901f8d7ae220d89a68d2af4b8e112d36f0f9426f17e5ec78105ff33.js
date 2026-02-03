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
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建可收集物体纹理（白色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffffff, 1);
    collectibleGraphics.fillCircle(10, 10, 10);
    collectibleGraphics.generateTexture('collectible', 20, 20);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建可收集物体组
    this.collectibles = this.physics.add.group();

    // 随机生成20个可收集物体
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(10); // 设置圆形碰撞体
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加边界
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 1);
    graphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
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
    // 销毁可收集物体
    collectible.destroy();

    // 增加分数
    this.score += 10;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有物体
    if (this.collectibles.countActive(true) === 0) {
      this.scoreText.setText('Score: ' + this.score + ' - YOU WIN!');
      this.physics.pause();
    }
  }
}

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

const game = new Phaser.Game(config);