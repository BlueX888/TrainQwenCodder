class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.level = 1;
    this.score = 0;
    this.maxLevel = 20;
    this.seed = 12345; // 固定随机种子保证确定性
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（白色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物品纹理（白色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffffff, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();

    // 生成当前关卡的物品
    this.generateLevelItems();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 48, `Score: ${this.score}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加背景色（深色背景以便看清白色物体）
    this.cameras.main.setBackgroundColor('#222222');
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

  // 生成当前关卡的物品
  generateLevelItems() {
    // 每关物品数量随关卡递增（5 + level * 2，最多25个）
    const itemCount = Math.min(5 + this.level * 2, 25);

    // 使用固定种子的伪随机数生成器
    const rng = this.createSeededRandom(this.seed + this.level);

    for (let i = 0; i < itemCount; i++) {
      // 生成随机位置（避免边缘）
      const x = 50 + rng() * (700);
      const y = 50 + rng() * (500);

      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }
  }

  // 收集物品
  collectItem(player, item) {
    item.destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    // 检查是否收集完所有物品
    if (this.items.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  // 进入下一关
  nextLevel() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.levelText.setText(`Level: ${this.level}`);

      // 重置玩家位置
      this.player.setPosition(400, 300);
      this.player.setVelocity(0, 0);

      // 生成新关卡的物品
      this.generateLevelItems();
    } else {
      // 游戏完成
      this.add.text(400, 300, 'All Levels Complete!', {
        fontSize: '48px',
        fill: '#ffffff'
      }).setOrigin(0.5);

      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.cursors = null;
    }
  }

  // 创建基于种子的伪随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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