class CollectGame extends Phaser.Scene {
  constructor() {
    super('CollectGame');
    this.collectedCount = 0;
    this.totalCollectibles = 15;
    this.gameCompleted = false;
  }

  preload() {
    // 使用Graphics创建纹理，不需要外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillRect(0, 0, 20, 20);
    collectibleGraphics.generateTexture('collectible', 20, 20);
    collectibleGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成15个收集物
    for (let i = 0; i < this.totalCollectibles; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCollideWorldBounds(true);
      collectible.setBounce(0.5);
      collectible.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, '收集: 0 / 15', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  collectItem(player, collectible) {
    // 移除收集物
    collectible.destroy();

    // 增加计数
    this.collectedCount++;

    // 更新文本
    this.scoreText.setText(`收集: ${this.collectedCount} / ${this.totalCollectibles}`);

    // 检查是否通关
    if (this.collectedCount >= this.totalCollectibles) {
      this.gameCompleted = true;
      this.winText.setVisible(true);
      this.player.setVelocity(0, 0);
      // 禁用玩家输入
      this.cursors = null;
    }
  }

  update() {
    if (this.gameCompleted || !this.cursors) {
      return;
    }

    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
    const speed = 200;

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
  scene: CollectGame
};

const game = new Phaser.Game(config);