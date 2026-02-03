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
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建可收集物体纹理（黄色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0xffff00, 1);
    collectibleGraphics.fillCircle(15, 15, 15);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建可收集物体组
    this.collectibles = this.physics.add.group();

    // 随机生成15个可收集物体
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(15);
      collectible.body.setAllowGravity(false);
      collectible.setImmovable(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(1);

    // 添加提示文本
    const instructionText = this.add.text(400, 580, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    instructionText.setOrigin(0.5);
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
    // 收集物体消失
    collectible.disableBody(true, true);

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否收集完所有物体
    if (this.collectibles.countActive(true) === 0) {
      // 显示胜利信息
      const victoryText = this.add.text(400, 300, 'All Collected!\nFinal Score: ' + this.score, {
        fontSize: '48px',
        fill: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
      });
      victoryText.setOrigin(0.5);
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.cursors = null;
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

// 导出可验证的状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}