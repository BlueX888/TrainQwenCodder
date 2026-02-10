class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.itemsPerLevel = 5;
    this.maxLevel = 10;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（绿色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0x00ff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.scoreText = this.add.text(16, 50, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 生成第一关的物品
    this.generateLevel();
  }

  generateLevel() {
    // 清空现有物品
    this.items.clear(true, true);

    // 使用种子生成伪随机位置
    const positions = this.generateRandomPositions(this.itemsPerLevel);

    // 创建收集物
    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12);
    });

    // 更新UI
    this.levelText.setText(`Level: ${this.level}`);
    this.messageText.setText('');
  }

  generateRandomPositions(count) {
    // 使用固定种子的伪随机数生成器
    const positions = [];
    let currentSeed = this.seed + this.level * 1000;

    for (let i = 0; i < count; i++) {
      // 简单的线性同余生成器
      currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
      const x = 50 + (currentSeed % 700);
      
      currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
      const y = 50 + (currentSeed % 400);

      positions.push({ x, y });
    }

    return positions;
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 增加分数
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.level >= this.maxLevel) {
      // 游戏胜利
      this.messageText.setText('YOU WIN! All Levels Complete!');
      this.messageText.setStyle({ fill: '#00ff00' });
      this.player.setVelocity(0, 0);
      this.cursors = null; // 禁用输入
    } else {
      // 进入下一关
      this.level++;
      this.messageText.setText('Level Complete!');
      this.time.delayedCall(1500, () => {
        this.generateLevel();
      });
    }
  }

  update(time, delta) {
    if (!this.cursors) return;

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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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