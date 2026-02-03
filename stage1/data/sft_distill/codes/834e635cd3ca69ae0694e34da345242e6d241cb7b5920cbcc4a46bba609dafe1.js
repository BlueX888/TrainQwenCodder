class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.collectibles = null;
    this.cursors = null;
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

    // 创建收集物纹理（红色圆形）
    const collectGraphics = this.add.graphics();
    collectGraphics.fillStyle(0xff0000, 1);
    collectGraphics.fillCircle(12, 12, 12);
    collectGraphics.generateTexture('collectible', 24, 24);
    collectGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 随机生成10个收集物
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.body.setSize(24, 24);
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

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(100);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    const hintText = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);
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
    if (this.collectibles.countActive(true) === 0 && this.score === 10) {
      this.add.text(400, 300, 'You Win!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);
    }
  }

  collectItem(player, collectible) {
    // 收集物消失
    collectible.disableBody(true, true);

    // 增加分数
    this.score += 1;

    // 更新分数显示
    this.scoreText.setText('Score: ' + this.score);

    // 可选：添加视觉反馈
    const flash = this.add.circle(collectible.x, collectible.y, 20, 0xffff00, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });
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
const game = new Phaser.Game(config);

// 暴露全局变量用于验证状态
window.getGameScore = function() {
  const scene = game.scene.scenes[0];
  return scene ? scene.score : 0;
};