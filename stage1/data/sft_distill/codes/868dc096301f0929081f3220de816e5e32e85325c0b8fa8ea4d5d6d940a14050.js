class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9932cc, 1);
    collectibleGraphics.fillCircle(16, 16, 16);
    collectibleGraphics.generateTexture('collectible', 32, 32);
    collectibleGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.collectibles = this.physics.add.group();
    
    // 在场景中随机位置生成3个收集物
    const positions = [
      { x: 200, y: 150 },
      { x: 400, y: 200 },
      { x: 600, y: 150 }
    ];

    positions.forEach(pos => {
      const collectible = this.collectibles.create(pos.x, pos.y, 'collectible');
      collectible.setCollideWorldBounds(true);
    });

    // 设置玩家与收集物的重叠检测
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

    // 添加说明文字
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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
    // 销毁收集物
    collectible.destroy();

    // 增加分数
    this.score += 10;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.add.text(400, 300, 'All Collected!', {
        fontSize: '48px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
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