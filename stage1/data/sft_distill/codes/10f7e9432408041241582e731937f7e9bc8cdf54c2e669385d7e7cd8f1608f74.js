class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
    this.maxLevel = 3;
    this.collectiblesPerLevel = 5;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（紫色圆形）
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x9933ff, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();
  }

  create() {
    // 初始化随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(300);

    // 创建收集物组
    this.collectibles = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 100, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    this.messageText.setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 生成第一关
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有收集物
    this.collectibles.clear(true, true);

    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.level}`);
    this.time.delayedCall(1500, () => {
      this.messageText.setText('');
    });

    // 根据关卡增加收集物数量
    const itemCount = this.collectiblesPerLevel + (this.level - 1) * 2;

    // 生成收集物
    for (let i = 0; i < itemCount; i++) {
      const x = this.rng.between(50, 750);
      const y = this.rng.between(150, 550);
      
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(12);
      collectible.body.setAllowGravity(false);
      collectible.body.immovable = true;
    }

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
  }

  collectItem(player, collectible) {
    // 销毁收集物
    collectible.destroy();

    // 增加分数（每关分数权重不同）
    this.score += 10 * this.level;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完本关所有物品
    if (this.collectibles.countActive(true) === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (this.level < this.maxLevel) {
      // 进入下一关
      this.level++;
      this.time.delayedCall(500, () => {
        this.generateLevel();
      });
    } else {
      // 游戏胜利
      this.physics.pause();
      this.messageText.setText(`Victory! Final Score: ${this.score}`);
      this.messageText.setStyle({ fontSize: '36px', fill: '#00ff00' });
      
      // 记录最终状态
      console.log('Game Complete!');
      console.log('Final Level:', this.level);
      console.log('Final Score:', this.score);
    }
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    // 玩家移动控制
    const acceleration = 600;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
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