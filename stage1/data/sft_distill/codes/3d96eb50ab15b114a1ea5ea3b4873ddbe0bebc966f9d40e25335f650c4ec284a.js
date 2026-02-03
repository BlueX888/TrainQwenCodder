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
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 生成收集物纹理（橙色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xff8800, 1);
    collectibleGraphics.fillCircle(15, 15, 15);
    collectibleGraphics.generateTexture('collectible', 30, 30);
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
      // 添加轻微的随机移动效果
      collectible.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      collectible.setBounce(1);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move and Collect Orange Items', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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

    // 检查是否收集完所有物品
    if (this.collectibles.countActive(true) === 0 && this.score > 0) {
      this.add.text(400, 300, 'All Items Collected!', {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
    }
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();
    
    // 增加分数
    this.score += 10;
    
    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 添加收集效果（可选）
    const collectText = this.add.text(
      collectible.x,
      collectible.y,
      '+10',
      {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);

    // 文字上浮并消失
    this.tweens.add({
      targets: collectText,
      y: collectText.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        collectText.destroy();
      }
    });
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

new Phaser.Game(config);